<template>
  <div class="searchContainer">
    <div v-if="searchValue" class="suggest">
      <div v-if="songs.length > 0">
        <div class="title">
          <Icon type="yinyue" :size="20"></Icon>
          <span>单曲</span>
        </div>
        <div v-for="(item, index) in songs" :key="index" class="list" @click="playSong(item.id)">
          <div
            class="item"
            :class="[+activeId === +item.id ? 'item-active' : '']"
            v-html="item?.name"
          ></div>
        </div>
      </div>
      <div v-if="playlists.length > 0" style="margin-top: 10px">
        <div class="title">
          <Icon type="playlist-menu" :size="20"></Icon>
          <span>歌单</span>
        </div>
        <div
          v-for="(item, index) in playlists"
          :key="index"
          class="list"
          @click="toPlayList(item.id)"
        >
          <div
            class="item"
            :class="[+activeId === +item.id ? 'item-active' : '']"
            v-html="item?.name"
          ></div>
        </div>
      </div>
    </div>
    <div v-else>
      <HotList :list="hots" :activeId="activeId"></HotList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getSearchHot, getSongDetail } from '@renderer/api'
import { computed, onMounted, ref } from 'vue'
import { useGlobalStore } from '@renderer/store/global'
import { useMusicStore } from '@renderer/store/music'
import HotList from './HotList.vue'
import { storeToRefs } from 'pinia'
import { replaceSearchKeyword, createSong } from '@renderer/utils/index'
import { useRouter } from 'vue-router'
const { searchValue, sugges, isSearchFouce } = storeToRefs(useGlobalStore())
const { addToPlaylist, startSong } = useMusicStore()
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  querySearchHot()
})
const hots = ref<Record<string, any>[]>([])
const activeId = ref<number>(0)
let currentIndex = -1
const links = computed(() => {
  return searchValue.value ? [...songs.value, ...playlists.value] : hots.value
})
const songIdS = computed(() => {
  return songs.value.map((item) => item.id)
})
// const playlistIdS = computed(()=>{
//   return  playlists.value.map(item=>item.id)
// })
function handleKeyDown(e) {
  if (e.key === 'ArrowDown') {
    const findIndex = links.value.findIndex((item) => item.id === activeId.value)
    if (findIndex < links.value.length - 1) {
      currentIndex = findIndex + 1
    } else {
      currentIndex = 0
    }

    // currentIndex = currentIndex + 1
    // if (currentIndex >= links.value.length) currentIndex = 0
    e.preventDefault()

  }
  if (e.key === 'ArrowUp') {
    const findIndex = links.value.findIndex((item) => item.id === activeId.value)
    if (findIndex > 0) {
      currentIndex = findIndex - 1
    } else {
      currentIndex = links.value.length - 1
    }
    // currentIndex = currentIndex - 1
    // if (currentIndex < 0) currentIndex = links.value.length - 1
    e.preventDefault()
  }
  activeId.value = searchValue.value
    ? links.value[currentIndex]?.id
    : links.value[currentIndex]?.score
  if (e.key === 'Enter') {
    if (songIdS.value.includes(activeId.value) && searchValue.value) {
      playSong(activeId.value)
    } else {
      toPlayList(activeId.value)
    }

    isSearchFouce.value = false
    // currentIndex = currentIndex-1
    // if(currentIndex<0)  currentIndex = links.value.length-1
    e.preventDefault()
  }
}
const songs = computed(() => {
  return (
    sugges.value?.songs?.map((item) => ({
      ...item,
      name: replaceSearchKeyword(`${item?.name} - ${item.artists[0].name}`, searchValue.value)
    })) ?? []
  )
})

const playlists = computed(() => {
  return (
    sugges.value?.playlists?.map((item) => ({
      ...item,
      name: replaceSearchKeyword(item?.name, searchValue.value)
    })) ?? []
  )
})
const router = useRouter()
function toPlayList(id) {
  router.push({
    path: `/playlist/${id}`
  })
}

async function playSong(id) {
  const songDetails = await getSongDetail(id)

  const result = songDetails.songs?.map(
    ({ id, name, al, ar, mv, dt, ...res }) =>
      createSong({
        ...res,
        id,
        name,
        artists: ar,
        duration: dt,
        mvId: mv,
        albumName: al.name,
        img: al.picUrl,
        isDownLoad: false,
        progress: 0
      }) ?? []
  )
  startSong(result[0])
  addToPlaylist(result[0])
  // console.log(result)
}

async function querySearchHot() {
  const res = await getSearchHot()
  if (res.code !== 200) return
  hots.value = res.data ?? []
  console.log(hots.value, 'hots')
}
</script>

<style scoped lang="scss">
.searchContainer {
  max-height: calc(100% - #{$mini-player-height} - 80px);
  background-color: var(--body-bgcolor);
  z-index: 999;
  position: fixed;
  left: 22%;
  top: calc(#{$header-height} + 10px);
  width: 380px;
  border-radius: 5px;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 6px 20px 0 rgba(0, 0, 0, 0.19);
  transition: all 0.5s;
  overflow-y: auto;
  // padding: 20px;
}

.suggest {
  box-sizing: border-box;
  padding: 10px 0;
  .title {
    margin-left: 10px;
    display: flex;
    align-items: center;
    span {
      margin-left: 5px;
    }
  }
  .list {
    //margin-left: 20px;
    //.active {
    //  background: var(--sx-color-hover);
    //}

    .item {
      padding: 10px 35px;
      cursor: pointer;
      &-active {
        background-color: var(--sx-color-hover);
      }
    }
  }
}
</style>
