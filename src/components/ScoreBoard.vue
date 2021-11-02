<template>
  <div>
    <p>Greatest: {{ greatest }}</p>
    <p>Sum: {{ sum }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    sum () {
      return this.$store.getters.nonEmptyCells
        .map((cell) => cell.value)
        .reduce((acc, value) => acc + value)
    },
    greatest () {
      return this.$store.getters.nonEmptyCells
        .map((cell) => cell.value)
        .reduce((a, b) => Math.max(a, b))
    }
  }
}
</script>

<style scoped>
div {
    border: 1px solid black;
    text-align: left;
    padding: 1em;
}
</style>
