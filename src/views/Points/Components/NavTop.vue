<template>
  <b-nav fill tabs>
    <b-nav-item :active="activeList" :to="{name:'PointsList'}">
      All <i class="icon-options-vertical" />
    </b-nav-item>
    <b-nav-item :active="activeNew" :to="{name:'PointsNew'}">
      New <i class="icon-plus" />
    </b-nav-item>
    <b-nav-item v-if="activeEdit" :active="activeEdit" >
      Edit <i class="icon-cloud-upload" />
    </b-nav-item>
    <!-- <b-nav-item  >
      Import <i class="icon-cloud-upload" />
    </b-nav-item> -->
  </b-nav>
</template>

<script>
export default {
  props: {
    activeList: {
      type: Boolean
    },
    activeNew: {
      type: Boolean
    },
    activeEdit: {
      type: Boolean
    }
  },
  name: 'NavTop'
}
</script>
