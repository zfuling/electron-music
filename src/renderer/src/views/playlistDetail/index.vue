<template>
  <el-backtop :right="100" :bottom="100" target=".container" v-if="activeTab == 1" />
  <div class="container" style="height: 100%; overflow-y: auto">
    <div class="playlist-detail" v-if="playlist.id" ref="headerRef">
      <DetailHeader :playlist="playlist" :songs="tableData" />
      <div class="search-box">
        <ZTab :list="tabs" v-model="activeTab"></ZTab>
        <el-input
          v-model="searchText"
          style="width: 150px"
          size="small"
          placeholder="搜索歌单音乐"
          clearable
          :prefix-icon="Search"
          v-if="activeTab == 1"
          @focus="isListSearch = true"
          @blur="isListSearch = false"
        />
      </div>

      <ZTable
        :tableData="filteredSongs"
        :originalData="tableData"
        :columns="columns"
        :isIndex="true"
        :atviveId="atviveId"
        v-if="activeTab == 1"
      >
        <template #name="{ row }">
          <div class="u-line-1" style="display: flex; align-items: center">
            <div
              class="u-line-1"
              :style="{
                color: currentSong.id === row.id && atviveId === songSheetId ? '#EC4141' : '',
                flex: 3,
                'max-width': 'fit-content'
              }"
            >
              <div v-if="row?.isSearch" v-html="row.searchName" class="u-line-1"></div>
              <div v-else class="u-line-1">{{ row.name }}</div>
            </div>
            <div style="display: flex; flex: 1; height: 100%" v-if="row.mvId || row.fee">
              <div v-if="row.mvId" class="label">mv</div>
              <div v-if="row.fee === 1" class="label">vip</div>
            </div>
          </div>
        </template>
        <template #operation="{ row }">
          <div v-if="row.isDownLoad">
            <el-progress
              type="circle"
              :percentage="row.progress"
              status="success"
              width="20"
              stroke-width="2"
            />
          </div>

          <Icon type="xiazai" @click.stop="download(row)" v-else></Icon>
        </template>
      </ZTable>
      <div class="container-comment" v-if="activeTab == 2" ref="commentRef">
        <div v-if="hotComments.length > 0 && pagination.no === 1">
          <div class="title">精彩评论</div>
          <Comment :commentList="hotComments"></Comment>
        </div>
        <div
          v-if="playlistComment.length > 0"
          :style="{ 'margin-top': hotComments.length > 0 && pagination.no === 1 ? '50px' : '' }"
        >
          <div class="title">最新评论({{ pagination.total }})</div>
          <Comment :commentList="playlistComment"></Comment>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <el-pagination
            v-if="pagination.total > 50"
            v-model:current-page="pagination.no"
            v-model:page-size="pagination.size"
            background="background"
            layout="prev, pager, next"
            :total="pagination.total"
            @current-change="queryPlaylistComment()"
            @size-change="queryPlaylistComment()"
          />
        </div>
      </div>
      <div v-if="activeTab == 3">
        <Subscribers :list="SubscriberLIst"></Subscribers>
        <div style="display: flex; justify-content: center; margin-top: 20px">
          <el-pagination
            v-if="paginationSub.total > 60"
            v-model:current-page="paginationSub.no"
            v-model:page-size="paginationSub.size"
            background="background"
            layout="prev, pager, next"
            :total="paginationSub.total"
            @current-change="queryPlaylistSubscribers()"
            @size-change="queryPlaylistSubscribers()"
          />
        </div>
      </div>
    </div>
    <div class="box-empty" v-else>
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import DetailHeader from './Header.vue'
import Subscribers from './subscribers.vue'
import ZTab from '@renderer/components/ZTab.vue'
import ZTable from '@renderer/components/ZTable.vue'
import { formatTime, createSong } from '@renderer/utils'
import { useMusicStore } from '@renderer/store/music'
import { useGlobalStore } from '@renderer/store/global'
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'
const { currentSong, songSheetId } = storeToRefs(useMusicStore())
const { muicPath, isListSearch } = storeToRefs(useGlobalStore())
import {
  getSongDetail,
  getListDetail,
  getPlaylistComment,
  getPlaylistSubscribers,
  checkMusic
} from '@renderer/api'
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import Comment from '@renderer/components/Comment.vue'
import _ from 'lodash'
const activeTab = ref(1)
const atviveId = ref('')
const searchText = ref('')
const route = useRoute()
const tabs = ref([
  {
    label: '歌曲列表',
    value: '1'
  },
  {
    label: '评论',
    value: '2'
  },
  {
    label: '收藏者',
    value: '3'
  }
])

const copyTabs = _.cloneDeep(tabs.value)
const columns = ref([
  {
    label: '操作',
    value: 'operation',
    slotName: 'operation',
    align: 'center'
  },
  {
    label: '标题',
    value: 'name',
    searchValue: 'searchName',
    flex: '4',
    slotName: 'name'
  },
  {
    label: '歌手',
    value: 'artistsText',
    searchValue: 'searchArtistsText',
    flex: '3'
  },
  {
    label: '专辑',
    value: 'albumName',
    searchValue: 'searchAlbumName',
    flex: '2'
  },
  {
    label: '时间',
    value: 'durationSecond',
    render: (row) => `<div>${formatTime(row.durationSecond)}</div>`
  }
])
/***
 *
 * 获取收藏者
 */
const headerRef = ref()
const SubscriberLIst = ref([])
const paginationSub = ref({
  total: 0,
  size: 60,
  no: 1
})
async function queryPlaylistSubscribers() {
  if (headerRef.value) {
    headerRef.value.scrollIntoView()
  }
  const res = await getPlaylistSubscribers({
    id: route.params.id,
    limit: paginationSub.value.size,
    offset: (paginationSub.value.no - 1) * paginationSub.value.size
  })
  if (res.code !== 200) return
  SubscriberLIst.value = res.subscribers
  paginationSub.value.total = res.total
}

/**
 * 获取歌单评论
 */
const commentRef = ref()
const playlistComment = ref([])
const hotComments = ref([])
const pagination = ref({
  total: 0,
  size: 50,
  no: 1
})
async function queryPlaylistComment() {
  if (commentRef.value) commentRef.value.scrollIntoView()
  const res = await getPlaylistComment({
    id: route.params.id,
    offset: (pagination.value.no - 1) * pagination.value.size
  })
  if (res.code !== 200) return
  playlistComment.value = res.comments
  if (pagination.value.no === 1) hotComments.value = res.hotComments
  pagination.value.total = res.total
  tabs.value[1].label = `${copyTabs[1].label}(${res.total}) `
}

/**
 *
 * @param newval 当前歌单id
 */
const playlist = ref<Record<string, any>>({})
async function initPlayList() {
  const res = await getListDetail({ id: route.params.id })
  if (res.code !== 200) {
    playlist.value = []
    return
  }
  playlist.value = res.playlist
  genSonglist(playlist.value)
}
/**
 *
 * @param playlist 歌单列表
 */
const tableData = ref<any[]>([])
async function genSonglist(playlist) {
  const trackIds = playlist.trackIds.map(({ id }) => id)
  const songDetails = await getSongDetail(trackIds.slice(0, trackIds.length))

  const result = songDetails.songs.map(({ id, name, al, ar, mv, dt, ...res }) =>
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
    })
  )
  tableData.value = result
}
/**
 *
 * @param result 替换的字符串
 * @param keyword 搜索关键字
 */

function useBrightenKeyword(result: string, keyword) {
  const Reg = new RegExp(keyword, 'ig')
  let res = ''
  if (result) {
    res = result.replace(Reg, `<span style="color: #507DAF;">$&</span>`)
    return res
  }
  return result
}

const filteredSongs = computed(() => {
  return searchText.value
    ? tableData.value
        .filter(({ name, artistsText, albumName }) =>
          `${name}${artistsText}${albumName}`.toLowerCase().includes(searchText.value.toLowerCase())
        )
        .map((item: any) => {
          return {
            ...item,
            isSearch: true,
            searchName: useBrightenKeyword(item.name, searchText.value),
            searchArtistsText: useBrightenKeyword(item.artistsText, searchText.value),
            searchAlbumName: useBrightenKeyword(item.albumName, searchText.value)
          }
        })
    : tableData.value
})

/**
 * 下载歌曲
 */

window.api.downloadProgress((_event, progress, id) => {
  const progressNum = Math.round(progress * 100)
  const findIndex = filteredSongs.value.findIndex((item) => item.id === id)
  tableData.value[findIndex].isDownLoad = true
  tableData.value[findIndex].progress = progressNum
  console.log(typeof progressNum)
  if (progressNum === 100) {
    tableData.value[findIndex].isDownLoad = false
    tableData.value[findIndex].progress = 100
  }
})
const router = useRouter()
async function download(row) {
  console.log(row)
  if (!muicPath.value) {
    ElMessage({
      duration: 1000,
      type: 'warning',
      message: '请设置下载目录'
    })
    setTimeout(() => {
      router.push({
        path: '/download'
      })
    }, 500)

    return
  }
  const res = await checkMusic(row.id)
  if (!(res.success && (row.fee == 8 || row.fee === 0))) {
    ElMessage.warning(res.message === 'ok' ? '当前歌曲需要vip' : res.message)
    return
  }
  // row.isDownLoad = true

  window.api.downLoadMusic(row.url, row.name, muicPath.value, row.id)
}

/**
 * 监听路由值变化重新获取数据
 */
watch(
  () => route.params.id,
  (newval) => {
    if (headerRef.value) headerRef.value.scrollIntoView()
    atviveId.value = newval as string
    activeTab.value = 1
    initPlayList()
    queryPlaylistComment()
    queryPlaylistSubscribers()
  },
  {
    immediate: true
  }
)

watch(
  () => activeTab.value,
  () => {
    pagination.value.no = 1
    paginationSub.value.no = 1
    initPlayList()
    queryPlaylistComment()
    queryPlaylistSubscribers()
  }
)
</script>

<style lang="scss" scoped>
:deep(.el-input--small .el-input__wrapper) {
  background-color: var(--input-bgcolor);
  box-shadow: none;
}
.u-line-1 {
  @include text-ellipsis;
}
:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #ec4141;
}
.box-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
}
.playlist-detail {
  padding-bottom: 50px;
  .label {
    border: 1px solid #ed5454;
    padding: 0 4px;
    color: #ed5454;
    margin-left: 5px;
    height: 15px;
    line-height: 15px;
    font-size: 12px;
    cursor: pointer;
  }
  .search-box {
    margin: 0px 36px 20px 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .container-comment {
    margin: 0 36px;
    .title {
      font-size: 15px;
      font-weight: bold;
    }
  }
}
</style>
