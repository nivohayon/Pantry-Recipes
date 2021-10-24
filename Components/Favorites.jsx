import { Icon } from 'native-base';
import { Button } from '@ui-kitten/components';
import React, { useState, useEffect } from 'react';
import {Text, View, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ScrollView, RefreshControl, ActivityIndicator} from 'react-native'
import { useAuth } from '../Context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { GetAllRecepiesIngredientsUrl, GetSavedIngredientsUrl, GetSavedRecepiesUrl, RemoveRecepieUrl, SaveRecepieUrl } from '../Context/ApiUrls';

const SaveRecepie = (body) =>{
  axios({
    method: 'post',
    url: SaveRecepieUrl,
    data: body
  }).catch(e=>console.log(e.message));
}
const RemoveRecepie = (body) =>{
  axios({
    method: 'post',
    url: RemoveRecepieUrl,
    data: body
  }).catch(e=>console.log(e.message));
}

export default function Recepies({navigation}){
    const [savedRecepies, setsavedRecepies] = useState()
    const [recepiesIngredients, setRecepiesIngredients] = useState()
    const {signout, currentUser} = useAuth()
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)

    const GetSavedRecepies = () =>{
      const GetSavedRecepies = `${GetSavedRecepiesUrl}/${currentUser.email}/`
      const GetSavedIngredients = `${GetSavedIngredientsUrl}/${currentUser.email}/`
      axios.get(GetSavedRecepies).then((res)=>{
        axios.get(GetSavedIngredients).then((saved)=>{
          axios.get(GetAllRecepiesIngredientsUrl).then((result)=>{
            const filteredRecepiesIngredients = new Array()
            result.data.forEach((item)=>{
              if(!saved.data.find(x=>x.ID === item.IngredientID))
                {
                  item.Name = `*Missing ${item.Name}`
                }
                filteredRecepiesIngredients.push(item)
            })
            res.data.forEach((e)=>e.checked = true)
            setsavedRecepies(res.data)
            if(res.data.length == 0)
              setloadingText("No Favorites Found")
            else
            {
              setLoading(false)
            }
            setRefreshing(false)
            setRecepiesIngredients(result.data)
          }).catch((e)=>console.log(e))
        }).catch((e)=>console.log(e))
      }).catch((e)=>console.log(e))
  }
      const ItemByUser = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={()=>{
            const RecepieIngredients = recepiesIngredients.filter((e)=>e.RecepieID === item.ID);
            let ingredientsText = ""
            for(let i=0; i < RecepieIngredients.length-1; i++)
            {
                ingredientsText += RecepieIngredients[i].Name + " \n"
            }
            ingredientsText += RecepieIngredients[RecepieIngredients.length-1].Name
            Alert.alert(
                item.Name,
                ingredientsText,
                [
                  {
                    text: "Close"
                  },
                  { text: "Instructions", onPress: async() => await WebBrowser.openBrowserAsync(item.Url)}
                ],
                { cancelable: true }
              );
        }}>
          <Image style={{width:300, height:150, top:10, alignSelf:"center"}} source={{uri: item.Image}}/>
          <Text style={styles.name}>{item.Name}</Text>
          <Text style={styles.subText}>Making Time: {item.MakingTime}</Text>
          <Text style={styles.subText}>Servings: {item.Servings}</Text>
          {item.checked ?
           <Icon type="FontAwesome" name="heart" style={{alignSelf:"center", fontSize:40, color: "red"}}
           onPress={()=>{
            const data = savedRecepies
            const index = data.findIndex(x=>x.ID===item.ID)
            data[index].checked = !data[index].checked
            const body = {"UserID": currentUser.email, "RecepieID": item.ID}
            data[index].checked ? SaveRecepie(body) : RemoveRecepie(body)
            setsavedRecepies(data)
            setRefresh(!refresh)
           }}/> 
          : <Icon type="FontAwesome" name="heart" style={{alignSelf:"center", fontSize:40, color: "grey"}} 
          onPress={()=>{
            const data = savedRecepies
            const index = data.findIndex(x=>x.ID===item.ID)
            data[index].checked = !data[index].checked
            const body = {"UserID": currentUser.email, "RecepieID": item.ID}
            data[index].checked ? SaveRecepie(body) : RemoveRecepie(body)
            setsavedRecepies(data)
            setRefresh(!refresh)
           }}/>}
        </TouchableOpacity>
      );
      const renderItemByUser = ({ item }) => <ItemByUser item={item} />;
      useEffect(()=>{
        if(currentUser)
        {
          GetSavedRecepies()
        }
      },[])

      const [refreshing, setRefreshing] = useState(false);
      const [loadingText, setloadingText] = useState("Loading...");

  const onRefresh = () => {
    setloadingText("Loading...")
    setRefreshing(true)
    setLoading(true)
    GetSavedRecepies()
  }
    if (currentUser)
    {
        return(
            <View style={styles.container}>
                <Text style={styles.header}>Your Favorites</Text>
              {loading ? <ScrollView contentContainerStyle={{alignItems:"center", flex:1, justifyContent:"center"}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
                            <Text style={{fontSize:30, fontFamily:"sans-serif-thin"}}>{loadingText}{loadingText === "No Favorites Found" ? <View></View> : <ActivityIndicator size="large" color="#fc2803"/>}</Text>
                            <Text style={{fontSize:16, fontFamily:"sans-serif-thin"}}>scroll down to refresh</Text>
                         </ScrollView> :
              <FlatList extraData={refresh} data={savedRecepies} renderItem={renderItemByUser} keyExtractor={item => item.ID.toString()} 
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}/>}
          </View>
          )
    }
    else
    {
        return(
          <View style={{alignItems:"center", flex:1, justifyContent:"center"}}>
            <Text style={{fontSize:18, fontFamily:"sans-serif-thin"}}>You Must Sign In To Use This Feature</Text>
            <Button style={styles.button} onPress={()=>{navigation.navigate('Settings')}}><Text>Sign In</Text></Button>
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
      backgroundColor: '#dbdbdb',
      borderWidth:1,
      borderColor:"#aaaaaa",
      borderRadius:25,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    name: {
        fontSize: 20,
        padding:20,
        alignSelf:"center"
    },
    subText: {
        fontSize:14,
        alignSelf:"center",
        paddingBottom:20
    },
    checkBox: {
      alignSelf:"flex-end",
      bottom:20
    },
    button:{
      margin:20
    },
  });