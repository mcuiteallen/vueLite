<template>
  <svg>
    <use :class="useClass" :xlink:href="`#${iconName}`"></use>
  </svg>
</template>

<script>
export default {
  name: 'SvgIcon',
  props: ['useClass', 'iconName']
}
</script>
