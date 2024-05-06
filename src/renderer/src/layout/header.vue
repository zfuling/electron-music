<template>
  <div class="header drag" :class="[{ 'header-bottom': theme === 'dark' }]">
    <div class="left">
      <el-input
        ref="searchInputRef"
        v-model="searchValue"
        class="nodrag"
        placeholder="search"
        :prefix-icon="Search"
        style="height: 30px"
        @focus="isSearchFouce = true"
        @blur="delayBlur"
        @input="debounceSearch"
        @keypress.enter="handleSearch"
      />
    </div>
    <div class="right nodrag">
      <User></User>

      <Theme />
      <Icon type="suoxiaochuangkou1" class="ml-15" @handleClick="windowChange(1)"></Icon>
      <Icon
        :type="isMax ? 'suoxiaochuangkou' : 'fangda'"
        class="ml-15"
        @handleClick="windowChange(2)"
      ></Icon>
      <Icon type="guanbi" class="ml-15" @handleClick="windowChange(3)"></Icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import Theme from '@renderer/components/theme.vue'
import User from '@renderer/components/User.vue'
import { Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useGlobalStore } from '@renderer/store/global'
import _ from 'lodash'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { getSearch, getSearchSuggest } from '@renderer/api/index'
// import { useMoveWindow } from '@renderer/composable/index'
const isMax = ref(false)
function windowChange(type) {
  window.api.windowChange(type)
}
window.api.resizeWindow((_event, value) => {
  isMax.value = value
})
const { searchValue, isSearchFouce, theme, sugges } = storeToRefs(useGlobalStore())
/**
 * 搜索建议列表
 */
const debounceSearch = _.debounce(handlesSuggest, 200)
async function handlesSuggest() {
  if (!searchValue.value) return
  const res = await getSearchSuggest(searchValue.value)
  if (res.code !== 200) return
  sugges.value = res.result
}

const searchInputRef = ref()
async function handleSearch() {
  if (!searchValue.value) {
    ElMessage({
      message: '请输入你要搜索的内容',
      type: 'warning',
      duration: 1500
    })
    return
  }
  const res = await getSearch({
    keywords: searchValue.value
  })
  console.log(res)
  if (searchInputRef.value) searchInputRef.value?.blur()
}
function delayBlur() {
  setTimeout(() => {
    isSearchFouce.value = false
  }, 200)
}
</script>

<style scoped lang="scss">
.ml-15 {
  margin-left: 15px;
}
.header-bottom {
  border-bottom: 1px solid #ec4141;
}
.header {
  display: flex;
  height: $header-height;
  width: 100%;
  justify-content: flex-end;
  position: relative;
  background-color: var(--header-bgcolor);
  padding-right: 15px;

  :deep(.iconfont) {
    color: var(--header-font-color);
  }

  .left {
    height: 100%;
    position: absolute;
    left: 22%;
    display: flex;
    align-items: center;
    :deep(.el-input .el-input__wrapper) {
      background-color: var(--header-input-bgcolor);
      box-shadow: none;
      border-radius: 20px;
    }
    :deep(.el-input__inner) {
      color: var(--header-input-color);
    }
    :deep(.el-input__inner::placeholder) {
      color: var(--header-input-placeholdercolor);
    }
    :deep(.el-input__prefix-inner) {
      color: var(--header-input-placeholdercolor);
    }
  }

  .right {
    display: flex;
    height: 100%;
    align-items: center;
    .operation {
      display: flex;
    }
  }
}
</style>
