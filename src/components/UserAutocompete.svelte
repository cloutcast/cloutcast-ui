<script>
  import AutoComplete from 'simple-svelte-autocomplete';

  // export let theList = [];
  export let apiURL = "/bitclout/users";
  export let selectedItem;  

  export let disabled = false;
  export let inputId = 'userAutocomplete';
  export const getAutocomplete = async function(keyword) {
    let result = await fetch(`${apiURL}/${encodeURIComponent(keyword)}.json`);

    let theResults = await result.json();

    let profiles = theResults.ProfilesFound || [];
    return profiles;
  }

  export let onChange = async function() {
    console.log("no");
  }
  
</script>


<AutoComplete {disabled} {inputId} showClear={true} onChange={onChange} searchFunction={getAutocomplete} minCharactersToSearch=3 delay=500 localSearch=false labelFieldName="Username" valueFieldName="PublicKeyBase58Check" bind:selectedItem={selectedItem} />