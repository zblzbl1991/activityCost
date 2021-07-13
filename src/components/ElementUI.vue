<template>
  <el-form ref="form" label-width="80px">
    <el-form-item>
      <el-row>

      </el-row>
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
    <el-row justify="start">
      <el-col :span="16">
        <el-form-item v-for="(item,index) in group" :key="index">
          <transition name="el-fade-in-linear">
            <el-row justify="start" gutter="1">
              <el-button icon="el-icon-minus" @click="minusUser(index)" circle></el-button>
              <el-col :span="3">
                <slot name="label">{{ item.name }}</slot>
              </el-col>
              <el-col :span="8">
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
              <el-col :span="2">
                <el-input size="small" :controls="false" v-model="item.income"
                          :disabled="true">
                  <!--              <template #prepend>-->
                  <!--                应得金额-->
                  <!--              </template>-->
                  <!--              <template #append>-->
                  <!--                元-->
                  <!--              </template>-->
                </el-input>
              </el-col>

              <el-col :span="1"></el-col>
              <el-col :span="2">
                <el-input size="small" :controls="false" v-model="item.expend"
                          :disabled="true">
                  <!--              <template #prepend>-->
                  <!--                应付金额-->
                  <!--              </template>-->
                  <!--              <template #append>-->
                  <!--                元-->
                  <!--              </template>-->
                </el-input>
              </el-col>

            </el-row>
          </transition>

        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-table
            :data="settlementArr"
            style="width: 100%">
          <el-table-column
              prop="desc"
              label="结果"
              width="180">
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>


  </el-form>


</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
      name: 'cost',
      setup(){

      },
      created() {

        let names = this.initNames
        names.forEach((name) => this.group.push(
            {name: name, cost: 0.0, income: 0.0, expend: 0.0, leftMoney: 0.0, flag: false}))
      },
      data() {
        return {
          addUserName: '',
          initNames: ['赵宝龙', '刘梓卉', '卜俊', '彭冠宏', '康洁', '沈浩斌', '邓惠予'],
          group: [],
          settlementArr: []
        }
      }, computed: {
        totalCost: function () {
          let total: number = 0;
          let group = this.group;
          let settlementArr = this.settlementArr
          settlementArr.length = 0
          group.forEach((prop: { cost: number; }) => {
            total = Number(prop.cost) + total
          })
          //四舍五入
          total = Math.round(total);
          //计算收入和支出
          //计算收入
          //先计算每人消费的平均值
          let avgCost = Math.round(total / group.length)
          let expendArr = []
          let incomeArr = []
          group.forEach((prop) => {
            let finalCost = prop.cost - avgCost;
            if (finalCost > 0) {
              prop.income = Math.round(finalCost)
              prop.leftMoney = prop.income
              //如果收钱,flag=true
              prop.flag = true
              prop.expend = 0
              incomeArr.push(prop)
            } else {
              prop.expend = Math.round(finalCost)
              prop.leftMoney = prop.expend
              //如果不收钱
              prop.flag = false
              prop.income = 0
              expendArr.push(prop)
            }
          })

          //计算如何分配谁给谁付款,进行结算
          for (let i = 0; i < expendArr.length; i++) {
            let expendUser = expendArr[i];
            // if(expendUser.name=='邓惠予'){
            //   console.log(2)
            //   // eslint-disable-next-line no-debugger
            //   debugger
            // }

            for (let j = 0; j < incomeArr.length; j++) {
              let incomeUser = incomeArr[j];
              if (incomeUser.leftMoney === 0) {
                continue
              }
              let number = incomeUser.leftMoney + expendUser.leftMoney;
              console.log(`${incomeUser.name}剩余金额${incomeUser.leftMoney}`)
              if (number >= 0) {
                //如果最后得到的金额是大于0的,说明这个人支出费用已经都结清了,剩余收入等于最新的金额,支出费用等于0
                incomeUser.leftMoney = number
                let money = expendUser.leftMoney
                expendUser.leftMoney = 0
                settlementArr.push({desc: `${expendUser.name}支付${Math.abs(money)}元给${incomeUser.name}`})
                break
              } else {
                // eslint-disable-next-line no-debugger
                //小于0,说明收入费用已经结清,需要下一个人进行结算,剩余收入等于0元,支出费用等于最新金额
                expendUser.leftMoney = number
                let money = incomeUser.leftMoney
                incomeUser.leftMoney = 0
                settlementArr.push({desc: `${expendUser.name}支付${Math.abs(money)}元给${incomeUser.name}`})
              }


            }
          }

          console.log(settlementArr)


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
)


</script>
