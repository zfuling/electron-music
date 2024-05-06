<template>
  <div>
    <div style="margin-left: 20px; margin-top: 20px">热搜榜</div>
    <div class="list">
      <div v-for="(item, index) in list" :key="index" class="item" :class="[{'item-active': +item.score === +activeId}]" ref="itemsRef">
        <div class="rank" :style="{ color: index + 1 <= 3 ? '#FF5858' : '' }">{{ index + 1 }}</div>
        <div class="songInfo">
          <div>{{ item.searchWord }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  list: any[]
  activeId: number
}>()
const itemsRef = ref<any[]>([])
const currentIndex = computed(()=>{
  return props.list.findIndex(item => +item.score === +props.activeId)
})
watch(
  () => props.activeId,
  () => {
    // 移动到对应选中该元素
    nextTick(() => {
      console.log()
      if(itemsRef.value[currentIndex.value]){
        itemsRef.value[currentIndex.value].scrollIntoView({
          behavior: 'smooth'
        })
      }

      // const el = document.querySelector(`.item-active`)
      // if (el) {
      //   el.scrollIntoView({
      //     behavior: 'smooth'
      //   })
      // }
    })
  },
  {
    immediate: true
  }
)
console.log(props)
</script>

<style scoped lang="scss">
.list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  //padding-top: 20px;
  .item {
    display: flex;
    padding: 20px;
    align-items: center;
    cursor: pointer;
    &:hover {
      background-color: var(--sx-color-hover);
    }
    &-active {
      background-color: var(--sx-color-hover);
    }

    .rank {
      margin-right: 20px;
      font-size: 16px;
      color: #e6e6e6;
    }
    .songInfo {
      font-size: 12px;
      font-weight: 500;
    }
  }
}
</style>
