<template>
  <el-form ref="form" label-width="80px">
    <el-form-item>
      <el-row>
        <el-col :span="2">
          <slot name="label">回车添加人员</slot>
        </el-col>
        <el-col :span="6">
          <el-input size="medium" v-model="addUserName" @change="addUser"></el-input>
        </el-col>

      </el-row>
    </el-form-item>
    <el-form-item>
      <el-row>
        <el-col :span="2">
          <slot name="label">总金额</slot>
        </el-col>
        <el-col :span="6">
          <el-input-number size="medium" :controls="false" v-model="totalCost"
                           :disabled="true"></el-input-number>
          元
        </el-col>

      </el-row>
    </el-form-item>

    <el-form-item v-for="(item,index) in group" :key="index">
      <transition name="el-fade-in-linear">
        <el-row>
          <el-button icon="el-icon-minus" @click="minusUser(index)" circle></el-button>
          <el-col :span="2">
            <slot name="label">{{ item.name }}</slot>
          </el-col>
          <el-col :span="6">
            <el-input
                onkeyup="value=value.replace(/[^0-9.]/g,'').replace(/^\./g, '').replace('.', 'dollar#dollar').replace(/\./g, '').replace('dollar#dollar', '.');"
                :controls="false" size="medium" maxlength="7" v-model="item.cost" placeholder="请输入金额">
              <template #prepend>
                已付金额
              </template>
              <template #append>
                元
              </template>
            </el-input>
          </el-col>
          <el-col :span="1"></el-col>
          <el-col :span="6">
            <el-input size="small" :controls="false" v-model="item.income"
                      :disabled="true">
              <template #prepend>
                应得金额
              </template>
              <template #append>
                元
              </template>
            </el-input>
          </el-col>

          <el-col :span="1"></el-col>
          <el-col :span="6">
            <el-input size="small" :controls="false" v-model="item.expend"
                      :disabled="true">
              <template #prepend>
                应付金额
              </template>
              <template #append>
                元
              </template>
            </el-input>
          </el-col>
        </el-row>
      </transition>

    </el-form-item>


  </el-form>


</template>

<script lang="ts">

export default {
  created() {

    let names = this.initNames
    names.forEach((name) => this.group.push({name: name, cost: 0.0, income: 0.0, expend: 0.0, flag: false}))
  },
  data() {
    return {
      addUserName: '',
      initNames: ['赵宝龙', '刘梓卉', '卜俊', '彭冠宏', '康洁', '沈浩斌', '邓惠予'],
      group: []
    }
  }, computed: {
    totalCost: function () {
      let total = 0;
      let group = this.group;
      group.forEach((prop) => {
        total += Number(prop.cost)
      })
      total = (total).toFixed(2)
      //计算收入和支出
      //计算收入
      //先计算每人消费的平均值
      let avgCost = (total / group.length).toFixed(2)
      group.forEach((prop) => {
        let finalCost = Number(prop.cost) - avgCost;
        if (finalCost > 0) {
          prop.income = finalCost.toFixed(2)
          //如果收钱,flag=true
          prop.flag = true
          prop.expend = 0
        } else {
          prop.expend = finalCost.toFixed(2)
          //如果不收钱
          prop.flag = false
          prop.income = 0
        }
      })
      let arr=[]
      let needIncomeUsers = group.filter((x) => x.flag === true);
      let needExpendUsers = group.filter((x) => x.flag === false);
      for (let expendUser in needExpendUsers) {
        let expend = Number(expendUser.expend);
        if(expendUser.leftMoney===null){
          expendUser.leftMoney=expend
        }
        for (let incomUser in needIncomeUsers) {
          // eslint-disable-next-line no-debugger
          debugger
          let income = incomUser.income;
          if(incomUser.leftMoney===null){
            incomUser.leftMoney=income
          }
          if(incomUser.leftMoney>0){
            //如果支出者剩余金额大于收入金额,则更新支出者的剩余金额,收入者的剩余金额为0
            if(expendUser.leftMoney>=income){
              let newVar = expendUser.leftMoney+income.leftMoney;
              expendUser.leftMoney=newVar
              incomUser.leftMoney=0
            arr.push(`${expendUser.name}付${expendUser.leftMoney}元给${incomUser.name}`)
            }else{
              //如果支出者剩余金额不足,则更新收入者剩余金额,支出者剩余金额为0
              let newVar = expendUser.leftMoney+income.leftMoney;
              incomUser.leftMoney=newVar
              expendUser.leftMoney=0
                 arr.push( `${expendUser.name}付${expendUser.leftMoney}元给${incomUser.name}`)
            }
          }
        }
      }

      console.log(arr)
      //分配金额
      return total;
    }
  }, methods: {
    minusUser(userIndex) {
      console.log(userIndex)
      let group = this.group
      group.splice(userIndex, 1)
    },
    addUser(userName) {
      console.log(userName)
      this.addUserName = ''
      this.group.push({name: userName, cost: 0.0, income: 0.0, expend: 0.0})
    }
  }
}
</script>