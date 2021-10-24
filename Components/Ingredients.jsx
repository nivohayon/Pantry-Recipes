import React, {useEffect, useState} from 'react';
import { CheckBox, Button, Text, Input, Icon } from '@ui-kitten/components';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, RefreshControl} from 'react-native';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios'
import { GetAllIngredientsUrl, GetSavedIngredientsUrl, RemoveIngredientUrl, SaveIngredientUrl } from '../Context/ApiUrls';

const SaveIngredient = (body) =>{
  axios({
    method: 'post',
    url: SaveIngredientUrl,
    data: body
  }).catch(e=>console.log(e));
}
const RemoveIngredient = (body) =>{
  axios({
    method: 'post',
    url: RemoveIngredientUrl,
    data: body
  }).catch(e=>console.log(e));
}

export default function Ingredients({navigation}){
    const {signout, currentUser} = useAuth()
    const [fullIngredients, setFullIngredients] = useState()
    const [ingredients, setIngredients] = useState()
    const [savedingredients, setSavedingredients] = useState()
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)
    const [search, setSearch] = useState("")
    const [refreshing, setRefreshing] = useState(false);

    const GetIngredientsWithSaved = () =>{
      const GetSaved = `${GetSavedIngredientsUrl}/${currentUser.email}/`
      axios.get(GetAllIngredientsUrl).then((res)=>{
        axios.get(GetSaved).then((result)=>{
          res.data.forEach((ingredient)=>{
            if(result.data.some((item)=>item.ID === ingredient.ID))
            {
              ingredient.checked = true;
            }
            else
            {
              ingredient.checked = false;
            }
          })
          setFullIngredients(res.data)
          setIngredients(res.data)
          setLoading(false)
          setRefreshing(false)
        }).catch((e)=>console.log(e))
      }).catch((e)=>console.log(e))
    }
    const Item = ({ item }) => (
      <TouchableOpacity style={styles.item} onPress={()=>{
        const data = ingredients
        const index = data.findIndex(x=>x.ID===item.ID)
        data[index].checked = !data[index].checked
        const body = {"UserID": currentUser.email, "IngredientID": item.ID}
        data[index].checked ? SaveIngredient(body) : RemoveIngredient(body)
        console.log(data.length);
        setIngredients(data)
        setRefresh(!refresh)
      }}>
        <Image style={{width:70, height:70, top:30}} source={{uri: item.PicUrl}}/>
        <CheckBox checked={item.checked} style={styles.checkBox} onChange={(isChecked)=>{
          const data = ingredients
          const index = data.findIndex(x=>x.ID===item.ID)
          data[index].checked = isChecked
          const body = {"UserID": currentUser.email, "IngredientID": item.ID}
          data[index].checked ? SaveIngredient(body) : RemoveIngredient(body)
          setIngredients(data)
          setRefresh(!refresh)
        }}/>
        <Text style={styles.ingredientName}>{item.Name}</Text>
      </TouchableOpacity>
    );
    const handleSearch = text => {
      setSearch(text)
      const data = fullIngredients.filter((item)=>item.Name.toLowerCase().includes(text.toLowerCase()))
      setIngredients(data)
    }
    const renderItem = ({ item }) => <Item item={item} />;

    const onRefresh = () => {
      setRefreshing(true);
      setLoading(true)
      GetIngredientsWithSaved()
    }

    useEffect(()=>{
      if(currentUser)
        GetIngredientsWithSaved()
    },[currentUser])


  if (currentUser)
  {
    return(
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Your Ingredients</Text>
        <View style={styles.searchBarContainer}>
          <Input value={search} onChangeText={(text)=>handleSearch(text)} placeholder='Search' style={styles.searchBar} clearButtonMode='always'/>
        </View>
        {loading ? <View style={{alignItems:"center", flex:1, justifyContent:"center"}}>
                      <Text style={{fontSize:20, fontFamily:"sans-serif-thin"}}>Loading...<ActivityIndicator size="large" color="#62fc03"/></Text>
                   </View> :
        <FlatList extraData={refresh} data={ingredients} renderItem={renderItem} keyExtractor={item => item.ID.toString()} refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}/>}
    </SafeAreaView>
    )
  }
  else
  {
    return(
      <View style={{alignItems:"center", flex:1, justifyContent:"center"}}>
        <Text style={{fontSize:18, fontFamily:"sans-serif-thin"}}>You Must Sign In To Use This Feature</Text>
        <Button style={styles.button} onPress={()=>{navigation.navigate('Settings')}}>Sign In</Button>
    </View>
    )
  }
    
}
const styles = StyleSheet.create({
  header:{
    textAlign:"center",
    marginTop:20,
    marginBottom:10,
    marginHorizontal:70,
    fontSize:24,
    borderBottomWidth:1,
    borderColor:"#aaaaaa"
  },
  container: {
    flex: 1,
    justifyContent:"space-between",
    top:10
  },
  item: {
    backgroundColor: '#eeeeee',
    alignItems:"baseline",
    borderWidth:1,
    borderRadius:25,
    borderColor:"#aaaaaa",
    paddingHorizontal: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  ingredientName: {
    fontSize: 26,
    alignSelf:"center",
    bottom:45,
    left:20,
    fontFamily:"sans-serif-thin",
    fontWeight:"bold"
  },
  checkBox: {
    alignSelf:"flex-end",
    bottom:20
  },
  button:{
    margin:20
  },
  searchBar:{
    borderRadius: 25,
    borderColor: '#333'
  },
  searchBarContainer:{
    backgroundColor: '#f3f3f3',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
});