<template>
  <div>
    <div style="margin-left: 20px">热搜榜</div>
    <div class="list">
      <div class="item" v-for="(item, index) in list" :key="index">
        <div class="rank" :style="{ color: index + 1 <= 3 ? '#FF5858' : '' }">{{ index + 1 }}</div>
        <div class="songInfo">
          <div>{{ item.searchWord }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  list?: any[]
}>()
console.log(props)
</script>

<style scoped lang="scss">
.list {
  display: flex;
  flex-direction: column;
  .item {
    display: flex;
    padding: 20px;
    align-items: center;
    cursor: pointer;
    &:hover {
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
