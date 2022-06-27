import Vue from 'vue'
import VeeValidate, { Validator } from 'vee-validate'

// validate language
import tw from 'vee-validate/dist/locale/zh_TW'
import cn from 'vee-validate/dist/locale/zh_CN'
import en from 'vee-validate/dist/locale/en'
import veeValidateDic from './veeValidateDic'

Vue.use(VeeValidate, { fieldsBagName: 'formFields', events: 'input|blur', dictionary: { tw, cn, en } })
Validator.localize({ tw: veeValidateDic.tw, cn: veeValidateDic.cn, en: veeValidateDic.en })

/** Custom Rule */
export default () => {
// 認證密碼
  const passwordValidator = {
    validate (value, args) {
      let oReg = new RegExp(
        /^(?=.{8,}$)(?=.*?[a-z_])(?=.*?[A-Z])(?=.*?[0-9])((?=.*?\W)|(?=.*?_)).*$/
      )
      let bValid = oReg.test(value)
      bValid = bValid && value.indexOf(' ') === -1
      bValid = bValid && value.indexOf('"') === -1
      bValid = bValid && value.indexOf('\\') === -1
      return bValid
    }
  }

  // 認證E-mail
  const emailValidator = {
    validate (value, args) {
      let oReg = new RegExp(
        /^(([^<>()\\[\]\\.,;:\s@"]+(\.[^<>()\\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
      let bValid = oReg.test(value)
      bValid = bValid && (value.indexOf(' ') === -1)
      bValid = bValid && (value.indexOf('"') === -1)
      bValid = bValid && (value.indexOf('\\') === -1)
      return bValid
    }
  }
  const ccValidator = {
    validate (value, args) {
      let bValid = true
      if (value !== '') {
        let oReg = new RegExp(
          /^[a-zA-Z0-9_.]{1,63}@[a-zA-Z0-9]{2,63}\.[a-zA-Z]{2,63}(\.[a-zA-Z]{2,63})?$/
        )
        let aMail = value.split(';')
        for (var i = 0; i < aMail.length; i++) {
          bValid = bValid && oReg.test(aMail[i])
        }
      }
      return bValid
    }
  }

  // 認證電話號碼
  const phoneValidator = {
    validate (value, args) {
      let oReg = new RegExp(
        /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/
      )
      let bValid = oReg.test(value)
      return bValid
    }
  }

  // 認證只能存在指定特殊字元
  const accountNameValidator = {
    validate (value, args) {
      let oReg = new RegExp(
        /^[A-z0-9@_. ]+$/
      )
      let bValid = oReg.test(value)
      return bValid
    }
  }

  // 連接埠必須介於0到65535之間
  const portValidator = {
    validate (value, args) {
      return value >= 0 && value <= 65535
    }
  }

  const connectiontValidator = {
    getMessage (field, args) {
      return '1 ~ 9999'
    },
    validate (value, args) {
      return value >= 1 && value <= 9999
    }
  }

  // 僅接受 a-z, A-Z, 0-9
  const normalCharacterValidator = {
    validate (value, args) {
      let oReg = new RegExp(/^[a-zA-Z0-9]*$/)
      let bValid = oReg.test(value)
      return bValid
    }
  }

  // 比較不一致
  const notConsistentValidator = {
    validate (value, args) {
      return value === args[0]
    }
  }

  // 不能接受中文
  const chineseBanValidator = {
    validate (value, args) {
      let oReg = new RegExp(/[^\u4e00-\u9fa5]+/)
      let bValid = oReg.test(value)
      return bValid
    }
  }

  // 僅接受 a-z, A-Z, 0-9, _, 空白
  const pkgTypedValidator = {
    validate (value, args) {
      let oReg = new RegExp(/^[a-zA-Z0-9_ ]*$/)
      let bValid = oReg.test(value)
      return bValid
    }
  }
  // 驗證版本格式
  const pkgVersionValidator = {
    validate (value, args) {
      let oReg3 = new RegExp(/^(\d{1,12}\.)(\d{1,12}\.)(\d{1,12})$/)
      let oReg4 = new RegExp(/^(\d{1,12}\.)(\d{1,12}\.)(\d{1,12}\.)(\d{1,12})$/)
      let bValid = oReg3.test(value) || oReg4.test(value)
      return bValid
    }
  }

  /** **限制大小****/
  const maxYearKeepValidator = {
    validate (value, args) {
      let oReg = new RegExp(/^[0-9]\d*$/)
      let bValid = oReg.test(value) && value >= 0 && value <= 365
      return bValid
    }
  }
  // 限制保留screenshot的份數
  const keepCopiesValidator = {
    validate (value, args) {
      let oReg = new RegExp(/^[0-9]\d*$/)
      let bValid = oReg.test(value) && value >= 0 && value <= 30
      return bValid
    }
  }
  // 最長保持天數不允許大於 30
  const maxDaysKeepValidator = {
    validate (value, args) {
      let oReg = new RegExp(/^[0-9]\d*$/)
      let bValid = oReg.test(value) && value >= 0 && value <= 30
      return bValid
    }
  }
  // 間隔不允許小於 5
  const intervalValidator = {
    validate (value, args) {
      return value >= 5
    }
  }

  Validator.extend('rulepasswordValidator', passwordValidator)
  Validator.extend('rulephoneValidator', phoneValidator)
  Validator.extend('ruleemailValidator', emailValidator)
  Validator.extend('ruleaccountNameValidator', accountNameValidator)
  Validator.extend('ruleccValidator', ccValidator)
  Validator.extend('rulemaxDaysKeepValidator', maxDaysKeepValidator)
  Validator.extend('ruleintervalValidator', intervalValidator)
  Validator.extend('rulePortValidator', portValidator)
  Validator.extend('ruleConnectiontValidator', connectiontValidator)
  Validator.extend('normalValidator', normalCharacterValidator)
  Validator.extend('not_consistent', notConsistentValidator)
  Validator.extend('rulepkgTypedValidator', pkgTypedValidator)
  Validator.extend('rulepkgVersionValidator', pkgVersionValidator)
  Validator.extend('rulemaxYearsKeepValidator', maxYearKeepValidator)
  Validator.extend('keepCopies', keepCopiesValidator)
  Validator.extend('chineseBan', chineseBanValidator)
}
