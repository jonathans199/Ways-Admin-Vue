<template>
  <b-card
    header-tag="header"
    footer-tag="footer">
    <div slot="header">
      <i class="icon-people"></i> <strong>  My customers</strong> - <small>  Abandoned carts</small>
    </div>
    <div class="row">
      <nav-left class="col-2"/>
    </div>
  </b-card>
</template>

<script>
import NavLeft from './../Components/NavLeft'

export default {
  components:{
    'nav-left': NavLeft
  }
  
}
</script>