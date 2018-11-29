<template>
    <b-nav vertical class="w-25">
      <li class="nav-item nav-link active">MENU</li>
      <b-dropdown-divider></b-dropdown-divider>
      <b-nav-item :to="{ name: 'CustomersList' }" active>All</b-nav-item>
      <b-nav-item  v-if="activeEdit" :active="activeEdit" >Edit</b-nav-item>
      <b-nav-item :to="{ name: 'CustomersNew' }">New</b-nav-item>
    </b-nav>
</template>

<script>
export default {
  name: 'NavLeft',
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
}
</script>
