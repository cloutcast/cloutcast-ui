<script>
  import {
    Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter, CardText, Button
  } from 'sveltestrap/src';

  export let title;
  export let body = ''; 
  export let subtitle = '';
</script>

<Card class="mb-3">
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardBody>
    <CardSubtitle>
      {@html subtitle}
    </CardSubtitle>
    <CardText>
      {@html body}
    </CardText>
    <slot></slot>
  </CardBody>
</Card>