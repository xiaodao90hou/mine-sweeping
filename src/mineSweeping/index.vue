<template>
  <div class="color-container">
    <div class="size-wrap">
      <div>选择棋盘大小</div>
      <div @click="selectSize(9)">9</div>
      <div @click="selectSize(16)">16</div>
      <div @click="selectSize(20)">20</div>
    </div>

    <div class="step-wrap">
      <div>当前棋盘大小</div>
      <div class="step">{{ blockCount }}</div>
      <div>步数</div>
      <div class="step">{{ step }}</div>
    </div>

    <div class="game-panel">
      <div class="game-scroll-panel" :class="isScale ? 'can-scroll' : ''">
        <div
          v-for="(index, col) in blockCount * blockCount"
          :key="col"
          :style="'width: ' + blockSize + '; height: ' + blockSize + ';'">
          <div
            class="col-item"
            :class="handleFontColor(index)"
            @click="clickBlock(index)"
            @click.right.prevent="changeMark(index)">
            {{ handleMineStatus(index) }}
          </div>
        </div>
      </div>
    </div>

    <div class="option-panel">
      <span @click="changeStatus(true)" class="option-btn" :class="isSweeping ? 'active' : ''">翻开</span>
      <span @click="changeStatus(false)" class="option-btn" :class="isSweeping ? '' : 'active'">插旗</span>
      <span @click="isScale = !isScale" class="option-btn" :class="isScale ? 'active' : ''">放大</span>
    </div>

    <div class="over-panel">
      <div class="over-text" v-if="isOver">
        {{ step === 1 ? '第一步就踩雷，运气爆棚，买彩票去吧~' : '很遗憾，失败了～' }}
      </div>
      <div class="over-text blue" v-else-if="isSuccess">恭喜！成功啦～</div>
      <span @click="init" class="restart">重新开始</span>
      <span @click="goHome" class="restart">返回首页</span>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import _ from 'underscore'
export default {
  setup() {
    const router = useRouter()
    const goHome = () => {
      router.push('/')
    }

    let data = reactive({
      isScale: false, // 放大
      isSweeping: true, // 翻牌状态
      mineTotalCount: 0,
      isOver: false, //游戏是否结束
      isSuccess: false, //游戏是否成功
      step: 0, //游戏步数
      blockCount: 9, //游戏棋盘大小
      mine: [true, false, false, false, false, false], // 出现雷的概率，1/6
      blockColors: {},
    })

    const blockSize = computed(() => {
      return (1 / data.blockCount) * 100 + '%'
    })

    const selectSize = (size) => {
      data.blockCount = size
      init()
    }

    const changeStatus = (isSweeping) => {
      data.isSweeping = isSweeping
    }

    const handleFontColor = (index) => {
      let className = ''
      // console.log(data.blockColors[index],index)

      if (data.blockColors[index].isDisplay) {
        className = 'white-bg'
        if (data.blockColors[index].mineCount === 1) {
          className = className + ' blue'
        } else if (data.blockColors[index].mineCount === 2) {
          className = className + ' yellow'
        } else if (data.blockColors[index].mineCount === 3) {
          className = className + ' green'
        } else if (data.blockColors[index].mineCount === 4) {
          className = className + ' pink'
        } else if (data.blockColors[index].mineCount === 5) {
          className = className + ' red'
        } else if (data.blockColors[index].hasMine) {
          className = className + ' red-bg'
        }
      }
      return className
    }

    /**
     * 返回值（炸弹 数值 旗子 空白地区）
     * @param {*} index
     */
    const handleMineStatus = (index) => {
      if (data.blockColors[index].isDisplay) {
        if (data.blockColors[index].hasMine) {
          return '💣'
        } else if (data.blockColors[index].mineCount) {
          return data.blockColors[index].mineCount
        }
      } else if (data.blockColors[index].isMark) {
        return '🚩'
      } else {
        return ''
      }
    }

    const getAroundMineCount = (index) => {
      if (data.blockColors[index].hasMine) return -1
      let count = 0

      // 确保当前格子有上一格
      // 假如不是第一行，检测上方方块     true系炸弹
      if (index > data.blockCount && data.blockColors[index - data.blockCount].hasMine) {
        count = count + 1
      }

      // 确保当前格子有下一格
      // 假如不是最后一行，检测下方方块
      if (index <= data.blockCount * (data.blockCount - 1) && data.blockColors[index + data.blockCount].hasMine) {
        count = count + 1
      }

      // 确保当前格子有右一格
      // 假如不是最右一行，检测右方方块
      if (index % data.blockCount !== 0 && data.blockColors[index + 1].hasMine) {
        count = count + 1
      }

      // 确保当前格子有左一格
      // 假如不是最左一行，检测左方方块
      if (index % data.blockCount !== 1 && data.blockColors[index - 1].hasMine) {
        count = count + 1
      }

      // 确保当前格子有左上一格
      // 假如不是第一行且不是最左行，检测左上方方块
      if (
        index > data.blockCount &&
        index % data.blockCount !== 1 &&
        data.blockColors[index - data.blockCount - 1].hasMine
      ) {
        count = count + 1
      }

      // 确保当前格子有右上一格
      // 假如不是第一行且不是最右行，检测右上方方块
      if (
        index > data.blockCount &&
        index % data.blockCount !== 0 &&
        data.blockColors[index - data.blockCount + 1].hasMine
      ) {
        count = count + 1
      }

      // 确保当前格子有左下一格
      // 假如不是最后一行且不是最左行，检测左下方方块
      if (
        index <= data.blockCount * (data.blockCount - 1) &&
        index % data.blockCount !== 1 &&
        data.blockColors[index + data.blockCount - 1].hasMine
      ) {
        count = count + 1
      }

      // 确保当前格子有右下一格
      // 假如不是最后一行且不是最右行，检测右下方方块
      if (
        index <= data.blockCount * (data.blockCount - 1) &&
        index % data.blockCount !== 0 &&
        data.blockColors[index + data.blockCount + 1].hasMine
      ) {
        count = count + 1
      }
      return count
    }

    /**
     * 游戏初始化
     */
    const init = () => {
      data.isOver = false
      data.isSuccess = false
      data.mineTotalCount = 0
      data.step = 0
      data.blockColors = {}

      // 给81个方块定炸弹
      for (let i = 1; i <= data.blockCount * data.blockCount; i++) {
        const hasMine = _.sample(data.mine) //参数是 1/6的概率     true  即表示炸弹
        if (hasMine) data.mineTotalCount += 1 //如果当前 块 是炸弹的话   数量加1
        data.blockColors[i] = {
          hasMine,
          isDisplay: false,
          isMark: false,
        }
      }

      // 给不是炸弹的方块定数值
      for (let index in data.blockColors) {
        const count = getAroundMineCount(parseInt(index))

        // -1 是炸弹,其余数值是附近 有炸弹数量
        if (count >= 0) {
          data.blockColors[index].mineCount = count
        }
      }
    }

    const handleArountBlockDisplay = (index) => {
      // 假如不是第一行，检测上方方块
      if (
        index > data.blockCount &&
        data.blockColors[index - data.blockCount].mineCount >= 0 &&
        !data.blockColors[index - data.blockCount].isDisplay
      ) {
        data.blockColors[index - data.blockCount].isDisplay = true
        data.blockColors[index - data.blockCount].mineCount === 0 && handleArountBlockDisplay(index - data.blockCount)
      }

      // 假如不是最后一行，检测下方方块
      if (
        index <= data.blockCount * (data.blockCount - 1) &&
        data.blockColors[index + data.blockCount].mineCount >= 0 &&
        !data.blockColors[index + data.blockCount].isDisplay
      ) {
        data.blockColors[index + data.blockCount].isDisplay = true
        data.blockColors[index + data.blockCount].mineCount === 0 && handleArountBlockDisplay(index + data.blockCount)
      }

      // 假如不是最右一行，检测右方方块
      if (
        index % data.blockCount !== 0 &&
        data.blockColors[index + 1].mineCount >= 0 &&
        !data.blockColors[index + 1].isDisplay
      ) {
        data.blockColors[index + 1].isDisplay = true
        data.blockColors[index + 1].mineCount === 0 && handleArountBlockDisplay(index + 1)
      }
      // 假如不是最左一行，检测左方方块
      if (
        index % data.blockCount !== 1 &&
        data.blockColors[index - 1].mineCount >= 0 &&
        !data.blockColors[index - 1].isDisplay
      ) {
        data.blockColors[index - 1].isDisplay = true
        data.blockColors[index - 1].mineCount === 0 && handleArountBlockDisplay(index - 1)
      }
    }

    const displayAllMine = () => {
      for (let index in data.blockColors) {
        data.blockColors[index].hasMine && (data.blockColors[index].isDisplay = true)
      }
    }
    const clickBlock = (index) => {
      // 游戏是否结束
      if (data.isOver) return

      if (!data.isSweeping) {
        // 如果不是翻开状态，则标记
        data.blockColors[index].isMark = !data.blockColors[index].isMark
        return
      }
      if (data.blockColors[index].isMark) {
        return
      }

      // 游戏步数加1
      data.step += 1
      data.blockColors[index].isDisplay = true

      if (data.blockColors[index].hasMine) {
        data.isOver = true
        displayAllMine()
        return
      }

      data.blockColors[index].mineCount === 0 && handleArountBlockDisplay(index)
    }

    const changeMark = (index) => {
      data.blockColors[index].isMark = !data.blockColors[index].isMark
    }

    init()

    return {
      ...toRefs(data),
      selectSize,
      blockSize,
      handleFontColor,
      handleMineStatus,
      clickBlock,
      changeMark,
      changeStatus,
      init,
      goHome,
    }
  },
}
</script>

<style scoped>

.color-container {
  margin: auto;
  max-width: 680px;
}

.size-wrap {
  padding: 15px 15px 0;
  display: flex;
  justify-content: space-around;
  color: #333;
  font-weight: 600;
}

.step-wrap {
  padding-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  justify-content: center;
}

.step-wrap .step {
  margin: 0 10px;
  font-weight: 600;
  color: #555;
}

.game-panel {
  margin: 20px auto;
  position: relative;
  width: 90vw;
  height: 90vw;
  max-width: 680px;
  max-height: 680px;
  overflow: hidden;
  box-shadow: 9px 9px 10px 0px rgb(0 0 0 / 50%);
  background-color: #333;
  overflow: scroll;
}

.game-scroll-panel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.can-scroll {
  width: 1000px;
  height: 1000px;
}

.col-item {
  width: 100%;
  height: 100%;
  display: inline-block;
  background-color: #ddd;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-weight: bold;
  font-size: 13px;
}

.white-bg {
  background-color: #fff;
}

.red-bg {
  background-color: red;
}

.pink {
  color: rgb(187, 63, 63);
}

.red {
  color: red;
}

.yellow {
  color: #cdcd21;
}

.blue {
  color: #1e90ff;
}

.green {
  color: #66cd00;
}

.color-btn-wrap {
  padding: 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.color-btn {
  border-radius: 10px;
  width: 10vw;
  height: 20vw;
  max-width: 80px;
  max-height: 120px;
}

.rule-wrap {
  padding: 15px;
  color: #ccc;
  font-size: 15px;
}

.option-panel {
  padding-top: 20px;
  text-align: center;
}

.option-btn {
  padding: 10px 20px;
  margin: 0 5px;
  border: 1px solid rgb(43, 90, 192);
  border-radius: 6px;
  display: inline-block;
}

.active {
  box-shadow: inset 1px 1px 8px 2px #0c3970;
}

.over-panel {
  padding-top: 25px;
  text-align: center;
}

.over-text {
  margin-top: 15px;
  font-size: 18px;
  color: #4b0082;
  font-weight: bold;
}

.restart {
  margin-top: 15px;
  padding: 10px 15px;
  background-color: #66cd00;
  border-radius: 15px;
  display: inline-block;
  color: #fff;
}
</style>
