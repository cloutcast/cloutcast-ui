<script>
import { Button, Container, Jumbotron } from "sveltestrap/src";
import WalletBreadcrumb from "../../../components/WalletBreadcrumb.svelte";


</script>
<WalletBreadcrumb subText="My CloutCast Reports" />
<Jumbotron>
  <Container>
    <h1 class="text-center">Reports</h1>
  </Container>
</Jumbotron>
<Container>
  <h5 class="text-muted">
    Free Reports
  </h5>
  <Button block disabled>
    Coming Soon!
  </Button>
  


<hr />

<h5 class="text-muted">
  HODLR Reports (~$10+)
</h5>
<Button block href="/my/reports/promo" color="info">
  Promotion Performance
</Button>
<hr />

<h5 class="text-muted">
  HODLR Reports (1+ $Clout_Cast)
</h5>
<Button block disabled>
  Coming Soon!
</Button>
</Container>