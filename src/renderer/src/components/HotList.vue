<template>
  <div>
    <div style="margin-left: 20px">热搜榜</div>
    <div class="list">
      <div class="item">
        <div class="rank">1</div>
        <div class="songInfo">
          <div>其实都没有</div>
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
      margin-right: 10px;
      font-size: 16px;
    }
    .songInfo {
      font-size: 14px;
      font-weight: bold;
    }
  }
}
</style>
