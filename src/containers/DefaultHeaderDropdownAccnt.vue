<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <img
        :src="avatar"
        class="img-avatar custom-avatar"
        alt="admin@bootstrapmaster.com" 
        />
    </template>\
    <template slot="dropdown">
      <b-dropdown-header
        tag="div"
        class="text-center">
        <strong>Settings</strong>
      </b-dropdown-header>
      <b-dropdown-item @click="logout">
        <i class="fa fa-lock" /> Logout
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<style>
  .custom-avatar {
    width: 35px;
    height: 35px;
  }
</style>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'
import * as config from '@/config/settings'
import { serverBus } from '@/main'

export default {
  name: 'DefaultHeaderDropdownAccnt',
  components: {
    AppHeaderDropdown
  },

  data: () => {
    return { 
      itemsCount: 42,
      avatar: '/img/anon_user.png'
    }
  },

  created(){
    // serverBus.$on('userUpdated', (val) => {
    //   this.avatar = val.avatar['thumb']
    // })
  },

  mounted(){
    // this.avatar = config.userData().avatar['thumb']
  },

  methods: {
    logout(){
      config.logout()
    }
  }
}
</script>
