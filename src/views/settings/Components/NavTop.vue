<template>
  <b-nav fill tabs>
    <b-nav-item :active="addresses" :to="{name:'Settings'}">
      Store Addresses <i class="icon-options-vertical" />
    </b-nav-item>
    <b-nav-item :active="apiKeys" :to="{name:'SettingsApis'}">
      Api Keys <i class="icon-plus" />
    </b-nav-item>
  </b-nav>
</template>

<script>
export default {
  props: {
    addresses: {
      type: Boolean
    },
    apiKeys: {
      type: Boolean
    }
  },
  name: 'NavTop'
}
</script>
