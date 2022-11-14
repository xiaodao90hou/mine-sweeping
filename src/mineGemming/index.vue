<template>
  <h1>Gemming</h1>
</template>

<script>
import { reactive, toRefs } from 'vue'
export default {
  setup() {

    let data = reactive({

    })
    
    return{
      ...toRefs(data)
    }
  }
}
</script>

<style>

</style>