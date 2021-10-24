import { Icon } from 'native-base';
import { Button } from '@ui-kitten/components';
import React, { useState, useEffect } from 'react';
import {Share, Text, View, SafeAreaView, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ScrollView, RefreshControl, ActivityIndicator} from 'react-native'
import { useAuth } from '../Context/AuthContext';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GetAllRecepiesIngredientsUrl, GetAllRecepiesUrl, GetSavedIngredientsUrl, GetSavedMustContainUrl, GetSavedRecepiesUrl, RemoveRecepieUrl, SaveRecepieUrl } from '../Context/ApiUrls';

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
    const [recepies, setRecepies] = useState()
    const [recepiesIngredients, setRecepiesIngredients] = useState()
    const {signout, currentUser} = useAuth()
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)
    const [loadingText, setloadingText] = useState("Loading...");
    const MAX_MISSING_KEY = "Max".toString()
    const FILTERING_KEY = "Filtering".toString()
    const [filtering, setFiltering] = useState()

    const GetAvailableRecepies = (all, allIng, savedMust) =>{
      let result = new Array()
      all.data.forEach((recepie)=>{
        const ingredients = allIng.data.filter(x=>x.RecepieID === recepie.ID)
        let flag = false
        ingredients.forEach((item)=>{
          if(savedMust.data.find(x=>x.ID === item.IngredientID))
          {
            flag = true
          }
        })
        if(flag)
        {
          result.push(recepie)
        }
      })
      return result
    }

    const GetAllRecepies = () =>{
        axios.get(GetAllRecepiesUrl).then((res)=>{
          setRecepies(res.data)
          axios.get(GetAllRecepiesIngredientsUrl).then((result)=>{
            setRecepiesIngredients(result.data)
            setLoading(false)
          }).catch((e)=>console.log(e))
        }).catch((e)=>console.log(e))
    }
    const GetAllRecepiesAsLoggedIn = async() =>{
      const GetSavedRecepies = `${GetSavedRecepiesUrl}/${currentUser.email}/`
      const GetSavedIngredients = `${GetSavedIngredientsUrl}/${currentUser.email}/`
      const GetSavedMustContain = `${GetSavedMustContainUrl}/${currentUser.email}/`
      const filter = await AsyncStorage.getItem(FILTERING_KEY)
      const max = await AsyncStorage.getItem(MAX_MISSING_KEY)
      setFiltering(filter === "true")
      axios.get(GetAllRecepiesUrl).then((res)=>{
        axios.get(GetSavedIngredients).then((saved)=>{
          axios.get(GetAllRecepiesIngredientsUrl).then((result)=>{
            axios.get(GetSavedMustContain).then((savedMust)=>{
              if(filter === "true")
              {
                const filteredRecepies = new Array()
                const filteredRecepiesIngredients = new Array()
                debugger
                const AllRecepies = savedMust.data.length === 0 ? res.data : GetAvailableRecepies(res, result, savedMust)
                AllRecepies.forEach((recepie)=>{
                  const ingredients = result.data.filter(x=>x.RecepieID === recepie.ID)
                  let Missflag = false
                  let missingCount = 0
                  ingredients.forEach((item)=>{
                    if(!saved.data.find(x=>x.ID === item.IngredientID))
                    {
                      missingCount++
                      if (missingCount > max)
                        Missflag = true
                      item.Name = `*Missing ${item.Name}`
                    }
                    if(!Missflag)
                    filteredRecepiesIngredients.push(item)
                  })
                  if(!Missflag)
                  {
                    filteredRecepies.push(recepie)
                  }
                })
                setRecepiesIngredients(filteredRecepiesIngredients)
                axios.get(GetSavedRecepies).then((saved)=>{
                  filteredRecepies.forEach((recepie)=>{
                    if(saved.data.some((item)=>item.ID === recepie.ID))
                    {
                      recepie.checked = true;
                    }
                    else
                    {
                      recepie.checked = false;
                    }
                  })
                  setRecepies(filteredRecepies)
                  if(filteredRecepies.length == 0)
                    setloadingText("No Recepies Found")
                  else
                  {
                    setLoading(false)
                  }
                  setRefreshing(false)
                }).catch((e)=>console.log(e))
              }
              else
          {
            const filteredRecepies = new Array()
            const filteredRecepiesIngredients = new Array()
            res.data.forEach((recepie)=>{
              const ingredients = result.data.filter(x=>x.RecepieID === recepie.ID)
              ingredients.forEach((item)=>{
                if(!saved.data.find(x=>x.ID === item.IngredientID))
                {
                  item.Name = `*Missing ${item.Name}`
                }
                filteredRecepiesIngredients.push(item)
              })
                filteredRecepies.push(recepie)
            })
            setRecepiesIngredients(filteredRecepiesIngredients)
            axios.get(GetSavedRecepies).then((saved)=>{
              filteredRecepies.forEach((recepie)=>{
                if(saved.data.some((item)=>item.ID === recepie.ID))
                {
                  recepie.checked = true;
                }
                else
                {
                  recepie.checked = false;
                }
              })
              setRecepies(filteredRecepies)
              if(filteredRecepies.length == 0)
                setloadingText("No Recepies Found")
              else
              {
                setLoading(false)
              }
              setRefreshing(false)
            }).catch((e)=>console.log(e))
            }}).catch((e)=>console.log(e))
          }).catch((e)=>console.log(e))
        }).catch((e)=>console.log(e))
      }).catch((e)=>console.log(e))
  }
    const Item = ({ item }) => (
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
          <Icon type="FontAwesome" name="heart" style={{alignSelf:"center", fontSize:40, color:"grey"}} onPress={()=>{
              Alert.alert(
                "Registered Users Feature",
                "Please Sign In/Sign Up To Use This Feature",
                [
                  {
                    text: "Not Now",
                  },
                  { text: "Sign In", onPress: () => navigation.navigate('Login') },
                  { text: "Sign Up", onPress: () => navigation.navigate('SignUp') }
                ],
                { cancelable: true }
              );
          }}/>
        </TouchableOpacity>
      );
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
                  {
                    text: "Share",
                    onPress: ()=> Share.share({message:item.Url})
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
            const data = recepies
            const index = data.findIndex(x=>x.ID===item.ID)
            data[index].checked = !data[index].checked
            const body = {"UserID": currentUser.email, "RecepieID": item.ID}
            data[index].checked ? SaveRecepie(body) : RemoveRecepie(body)
            setRecepies(data)
            setRefresh(!refresh)
           }}/> 
          : <Icon type="FontAwesome" name="heart" style={{alignSelf:"center", fontSize:40, color: "grey"}} 
          onPress={()=>{
            const data = recepies
            const index = data.findIndex(x=>x.ID===item.ID)
            data[index].checked = !data[index].checked
            const body = {"UserID": currentUser.email, "RecepieID": item.ID}
            console.log(body);
            data[index].checked ? SaveRecepie(body) : RemoveRecepie(body)
            setRecepies(data)
            setRefresh(!refresh)
           }}/>}
        </TouchableOpacity>
      );
      const renderItem = ({ item }) => <Item item={item} />;
      const renderItemByUser = ({ item }) => <ItemByUser item={item} />;
      
      useEffect(()=>{
        if(currentUser)
        {
          GetAllRecepiesAsLoggedIn()
        }
        else
        {
          GetAllRecepies()
        }
      },[refreshing])
      const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setloadingText("Loading...")
    setRefreshing(true);
    setLoading(true)
    GetAllRecepiesAsLoggedIn()
  }
  const AddIcon = () => (
    <Icon name='add'/>
  );
    if (currentUser)
    {
        return(
          <View style={styles.container}>
            <Text style={styles.header}>{filtering ? "Matching Recepies" : "All Recepies"}</Text>
              {loading ? <ScrollView contentContainerStyle={{alignItems:"center", flex:1, justifyContent:"center"}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
                            <Text style={{fontSize:30, fontFamily:"sans-serif-thin"}}>{loadingText}{loadingText === "No Recepies Found" ? <View></View> : <ActivityIndicator size="large" color="#fcba03"/>}</Text>
                            <Text style={{fontSize:16, fontFamily:"sans-serif-thin"}}>scroll down to refresh</Text>
                            {loadingText === "No Recepies Found" ? 
                            <Button style={styles.button} onPress={()=>navigation.navigate('Settings')}><Text>Turn Off Filtering</Text></Button>
                          :<View></View>}
                         </ScrollView> :
                        <FlatList extraData={refresh} data={recepies} renderItem={renderItemByUser} keyExtractor={item => item.ID.toString()}
                         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}/>}
            </View>

          )
    }
    else
    {
        return(
            <SafeAreaView style={styles.container}>
              <Text style={{textAlign:"center", marginTop:20, marginBottom:10, marginHorizontal:70, fontSize:24, borderBottomWidth:1, borderColor:"#aaaaaa"}}>Recepies</Text>
              {loading ? <View style={{alignItems:"center", flex:1, justifyContent:"center"}}>
                            <Text style={{fontSize:20, fontFamily:"sans-serif-thin"}}><ActivityIndicator size="small"/>Loading...</Text>
                         </View> :
              <FlatList extraData={refresh} data={recepies} renderItem={renderItem} keyExtractor={item => item.ID.toString()} />}
          </SafeAreaView>
          )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent:"space-between",
      top:10
    },
    header:{
      textAlign:"center",
      marginTop:20,
      marginBottom:10,
      marginHorizontal:70,
      fontSize:24,
      borderBottomWidth:1,
      borderColor:"#aaaaaa",
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
    scrollView: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addIcon:{

      opacity:50,
      borderRadius:63,
      height:60,
      width:60,
      top:40
    }
  });