<template>
  <div>
    <ul>
        <li v-for="(item,index) in gameGroup" :key="index" >
					<router-link :to="item.path">{{item.name}}</router-link>
				</li>
    </ul>
  </div>
</template>

<script>
import { reactive,toRefs } from 'vue'
import {useRouter} from 'vue-router'
export default {
	setup(){
		let data = reactive({
				gameGroup:[
					{name:'扫雷',path:'/sweeping'},
					{name:'挖鸡鸡哇',path:'/gemming'},
				]
		});

		
		return {
			...toRefs(data),
		}
	}
}
</script>

<style scoped>
ul{
	list-style: none;
}
</style>