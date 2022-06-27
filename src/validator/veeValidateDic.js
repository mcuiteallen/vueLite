
export default {
  tw: {
    messages: {
      // 覆寫原有 validator 錯誤訊息
      required: (field) => '此處必須填寫',
      email: (field) => '電子郵件格式不符',
      ip: (field) => '請輸入正確的IP格式，例如:127.0.0.1',
      min_value: (field, args) => `${field} 最小值為 ${args[0]}`,
      max_value: (field, args) => `${field} 最大值為 ${args[0]}`,
      rulepasswordValidator: (field) => `最少八個字元，至少一個數字，一個小寫字母，一個大寫字母和一個特殊字元（空格字元（），反斜杠（\\），雙引號（\"）是禁止的）`,
      rulephoneValidator: (field) => '電話格式無效，例如+886987654321',
      ruleemailValidator: (field) => '電子郵件格式不符',
      ruleaccountNameValidator: (field) => `特殊字元只接受 ' @ _ . '`,
      ruleccValidator: (field) => '電子郵件格式無效',
      rulemaxDaysKeepValidator: (field) => '保持天數區間為 0 到 30 之間，不允許小數點',
      ruleintervalValidator: (field) => '間隔不允許小於 5',
      rulePortValidator: (field) => '連接埠必須介於0到65535之間',
      normalValidator: (field) => '僅接受 a-z, A-Z, 0-9',
      not_consistent: (field) => {
        if (field === 'IoT Key') {
          return '輸入的IoT Key與原始IoT Key不一致'
        } else if (field === 'confirm passwd') {
          return '新密碼和確認密碼不一致'
        }
      },
      rulepkgTypedValidator: (field) => '僅接受 a-z, A-Z, 0-9, _',
      rulepkgVersionValidator: (field) => '版本格式無效，各段不超過12位數，例如 1.2.3.4',
      rulemaxYearsKeepValidator: (field) => '保持天數區間為 0 到 365 之間，不允許小數點',
      keepCopies: (field) => '保持份數區間為 0 到 30 之間，不允許小數點',
      chineseBan: (field) => '請輸入英文'
    }
  },
  cn: {
    messages: {
      // 覆寫原有 validator 錯誤訊息
      required: (field) => '此处必须填写',
      email: (field) => '电子邮件格式不符',
      ip: (field) => '请输入正确的IP格式，例如:127.0.0.1',
      min_value: (field, args) => `${field} 最小值为 ${args[0]}`,
      max_value: (field, args) => `${field} 最大值为 ${args[0]}`,
      rulepasswordValidator: (field) => `最少八个字符，至少一个数字，一个小写字母，一个大写字母和一个特殊字符（空格字符（），反斜杠（\\），双引号（\"）是禁止的）`,
      rulephoneValidator: (field) => '电话格式无效，例如+886987654321',
      ruleemailValidator: (field) => '电子邮件格式不符',
      ruleaccountNameValidator: (field) => `特殊字元只接受 ' @ _ . '`,
      ruleccValidator: (field) => '电子邮件格式无效',
      rulemaxDaysKeepValidator: (field) => '保持天数区间为 0 到 30 之间，不允许小数点',
      ruleintervalValidator: (field) => '间隔不允许小于 5',
      rulePortValidator: (field) => '端口必须介于0到65535之间',
      normalValidator: (field) => '仅接受 a-z, A-Z, 0-9',
      not_consistent: (field) => {
        if (field === 'IoT Key') {
          return '输入的IoT Key与原始IoT Key不一致'
        } else if (field === 'confirm passwd') {
          return '新密码和确认密码不一致'
        }
      },
      rulepkgTypedValidator: (field) => '仅接受 a-z, A-Z, 0-9, _',
      rulepkgVersionValidator: (field) => '版本格式无效，各段不超过12位数，例如 1.2.3.4',
      rulemaxYearsKeepValidator: (field) => '保持天数区间为 0 到 365 之间，不允许小数点',
      keepCopies: (field) => '保持份数区间为 0 到 30 之间，不允许小数点',
      chineseBan: (field) => '请输入英文'
    }
  },
  en: {
    messages: {
      // 覆寫原有 validator 錯誤訊息
      rulepasswordValidator: (field) => `Minimum eight characters, at least one number, one lowercase letter, one uppercase letter,  and one special character (Blank character( ), Backslash(\\), Double quotes(\") is prohibited)`,
      rulephoneValidator: (field) => 'Invalid phone format, e.g., +886987654321',
      ruleemailValidator: (field) => 'Error mail format',
      ruleaccountNameValidator: (field) => `Special characters only allowed ' @ _ . '`,
      ruleccValidator: (field) => 'Invalid mail format',
      rulemaxDaysKeepValidator: (field) => 'The Max Days Keep are between 0 and 30, decimal point is not allowed',
      ruleintervalValidator: (field) => 'The interval must not be less than 5',
      rulePortValidator: (field) => 'Port must be between 0 to 65535',
      normalValidator: (field) => 'Only accept a-z, A-Z, 0-9',
      not_consistent: (field) => {
        if (field === 'IoT Key') {
          return 'The value is inconsistent with the original IoT Key.'
        } else if (field === 'confirm passwd') {
          return 'New password and confirm password is not consistent'
        }
      },
      rulepkgTypedValidator: (field) => 'Only accept a-z, A-Z, 0-9, _',
      rulepkgVersionValidator: (field) => 'Invalid version format and each segment does not exceed 12 digits, e.g., 1.2.3.4 ',
      rulemaxYearsKeepValidator: (field) => 'The Max Days Keep are between 0 and 365, decimal point is not allowed',
      keepCopies: (field) => 'The Max Copies Keep are between 0 and 30, decimal point is not allowed',
      chineseBan: (field) => 'Please Enter English'
    }
  }
}
