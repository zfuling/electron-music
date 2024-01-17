<template>
  <div class="searchContainer" :class="[searchValue ? 'searchContainer-value' : '']">
    <div v-if="searchValue" class="suggest">
      <div v-if="songs.length > 0">
        <div class="title">
          <Icon type="yinyue" :size="20"></Icon>
          <span>单曲</span>
        </div>
        <div
          class="list"
          v-for="(item, index) in songs"
          :key="index"
          @click="playSong(item.id)"
          :class="[atviveId === item.id]"
        >
          <div class="item" v-html="item?.name"></div>
        </div>
      </div>
      <div style="margin-top: 10px" v-if="playlists.length > 0">
        <div class="title">
          <Icon type="playlist-menu" :size="20"></Icon>
          <span>歌单</span>
        </div>
        <div
          class="list"
          v-for="(item, index) in playlists"
          :key="index"
          @click="toPlayList(item.id)"
          :class="[atviveId === item.id]"
        >
          <div class="item" v-html="item?.name"></div>
        </div>
      </div>
    </div>
    <div v-else>
      <HotList :list="hots"></HotList>
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
const { searchValue, sugges } = storeToRefs(useGlobalStore())
const { addToPlaylist, startSong } = useMusicStore()
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  querySearchHot()
})
const hots = ref<Record<string, any>[]>()
const atviveId = ref<number>()
function handleKeyDown(e) {
  if (e.keyCode === 38 && this.selectedIndex > 0) {
    // 上键
    this.selectedIndex--
  } else if (e.keyCode === 40 && this.selectedIndex < this.items.length - 1) {
    // 下键
    this.selectedIndex++
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
  hots.value = res.data
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
.searchContainer-value {
  width: 400px;
  height: 100%;
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
    // margin-left: 20px;
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
