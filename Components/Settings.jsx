import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native'
import { Button, Icon} from 'native-base';
import { useAuth } from '../Context/AuthContext';
import { CheckBox, Input } from '@ui-kitten/components';
import {StyleSheet, FlatList, TouchableOpacity, Image, Switch, TouchableHighlight, ToastAndroid, ActivityIndicator, RefreshControl} from 'react-native'
import {Restart} from 'fiction-expo-restart';
import NumericInput from 'react-native-numeric-input'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as LocalAuthentication from 'expo-local-authentication';
import { GetAllIngredientsUrl, GetSavedMustContainUrl, RemoveMustContainUrl, SaveMustContainUrl } from '../Context/ApiUrls';

const SaveMustContain = (body) =>{
    axios({
      method: 'post',
      url: SaveMustContainUrl,
      data: body
    }).catch(e=>console.log(e));
  }
  const RemoveMustContain = (body) =>{
    axios({
      method: 'post',
      url: RemoveMustContainUrl,
      data: body
    }).catch(e=>console.log(e));
  }


export default function Settings({navigation}) {
    const {signout, currentUser} = useAuth()
    const [signOutDisabled, setSignOutDisabled] = useState(false)
    const [fullIngredients, setFullIngredients] = useState()
    const [ingredients, setIngredients] = useState()
    const [loading, setLoading] = useState(true)
    const [refresh, setRefresh] = useState(false)
    const MAX_MISSING_KEY = "Max".toString()
    const FILTERING_KEY = "Filtering".toString()
    const [max, setMax] = useState()
    const [filtering, setFiltering] = useState()
    const [search, setSearch] = useState("")
    const [refreshing, setRefreshing] = useState(false);

    const LoadSettings = async() =>{
        GetAllIngrerdients()
        const max = parseInt(await AsyncStorage.getItem(MAX_MISSING_KEY))
        max != null ? setMax(max) : setMax(0)
        const filtering = await AsyncStorage.getItem(FILTERING_KEY)
        filtering != null ? setFiltering(filtering === "true") : setFiltering(true)
    }

    const ScanFingerPrintOrSignOut = async() =>{
      try {
        const hasSensor = await LocalAuthentication.hasHardwareAsync()
        if(!hasSensor)
        {
          ToastAndroid.show("Bye Bye!", ToastAndroid.SHORT)
          await signout()
          Restart();
          return
        }
        const result = await LocalAuthentication.authenticateAsync({promptMessage:"Use Fingerprint To Sign Out"})
        if(result.success)
        {
          ToastAndroid.show("Bye Bye!", ToastAndroid.SHORT)
          await signout()
          Restart();
        }
        else
        {
          setSignOutDisabled(false)
        }
      }
      catch(e){
        console.log(e);
      }
    }

    const GetAllIngrerdients = () =>{
        const GetSavedMustContain = `${GetSavedMustContainUrl}/${currentUser.email}/`
        axios.get(GetAllIngredientsUrl).then((res)=>{
            axios.get(GetSavedMustContain).then((result)=>{
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
            })
        })
    }


    const Item = ({ item }) => (
        <TouchableOpacity style={styles.item} onPress={async()=>{
          const data = ingredients
          const index = data.findIndex(x=>x.ID===item.ID)
          data[index].checked = !data[index].checked
          const body = {"UserID": currentUser.email, "IngredientID": item.ID}
          data[index].checked ? SaveMustContain(body) : RemoveMustContain(body)
          setIngredients(data)
          setRefresh(!refresh)
        }}>
          <Image style={{width:50, height:50, top:25, right:30}} source={{uri: item.PicUrl}}/>
          <CheckBox checked={item.checked} style={styles.checkBox} onChange={(isChecked)=>{
            const data = ingredients
            const index = data.findIndex(x=>x.ID===item.ID)
            data[index].checked = isChecked
            const body = {"UserID": currentUser.email, "IngredientID": item.ID}
            data[index].checked ? SaveMustContain(body) : RemoveMustContain(body)
            setIngredients(data)
            setRefresh(!refresh)
          }}/>
          <Text style={styles.ingredientName}>{item.Name}</Text>
        </TouchableOpacity>
      );
      const renderItem = ({ item }) => <Item item={item} />;

      const onRefresh = () => {
        setRefreshing(true);
        setLoading(true)
        GetAllIngrerdients()
      }

      const handleSearch = text => {
        setSearch(text)
        const data = fullIngredients.filter((item)=>item.Name.toLowerCase().includes(text.toLowerCase()))
        setIngredients(data)
      }

      useEffect(()=>{
        if(currentUser)
            LoadSettings()
      }, [currentUser])

    return(
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <Text style={styles.title}>Max Missing Ingredients  <Icon type="FontAwesome" name="info-circle" style={{fontSize:20, color: "grey"}}
            onPress={()=>{
                Alert.alert(
                    "Max Missing Ingredients",
                    "If There Is A Recepie That Requires 5 Ingredients But You Have Only 3 Of Them,\n"+
                    "If The Number Is 2 You Would Get That Recepie As A Match.",
                    [
                      {
                        text: "OK"
                      }
                    ],
                    { cancelable: true }
                  );
            }}/></Text>
            <NumericInput initValue={max} value={max} containerStyle={styles.numberPicker} totalWidth={240} totalHeight={50} iconSize={25}
            minValue={0} maxValue={20} valueType='real' rounded iconStyle={{ color: 'black' }} onChange={async(num)=>{
                setMax(num)
                await AsyncStorage.setItem(MAX_MISSING_KEY,num.toString())
            }} />
            <Text style={styles.title}>Recepies Must Contain  <Icon type="FontAwesome" name="info-circle" style={{fontSize:20, color: "grey"}}
            onPress={()=>{
                Alert.alert(
                    "Recepies Must Contain",
                    "If You Want All The Recepies Results To Must Contain Certain Ingredient/s\n"+
                    "You Can Select In The List.",
                    [
                      {
                        text: "OK"
                      }
                    ],
                    { cancelable: true }
                  );
            }}/></Text>
            {loading ?<View style={styles.MustContainList}><Text>Loading...<ActivityIndicator size="large" color="#707070"/></Text></View>
             : <View style={styles.MustContainList}>
                <View style={styles.searchBarContainer}>
                  <Input value={search} onChangeText={(text)=>handleSearch(text)} placeholder='Search' style={styles.searchBar} clearButtonMode='always'/>
                </View>
                <FlatList extraData={refresh} data={ingredients} renderItem={renderItem} keyExtractor={item => item.ID.toString()} refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}/>
               </View>}
            <Text style={styles.title}>Contact Us</Text>
            <View style={{flex:1, flexDirection:"row", marginTop:10}}>
            <TouchableHighlight onPress={()=>{Linking.openURL("sms:+9720526327537?body=Hi! I Came From Pantry Recepies")}} underlayColor="white" style={{borderRadius:50}}>
                <Image style={{width:47, height:33, marginHorizontal:15, top:10}} source={require('../assets/sms_logo.png')}/>
            </TouchableHighlight>
            <TouchableHighlight onPress={()=>{Linking.openURL("mailto:nivohayon1582@gmail.com?subject=Pantry Recepies&body=Hi! I Came From Pantry Recepies")}} underlayColor="white" style={{borderRadius:50}}>
                <Image style={{width:45, height:30, marginHorizontal:15, top:10}} source={require('../assets/gmail_logo.png')}/>
            </TouchableHighlight>
            <TouchableHighlight onPress={()=>{Linking.openURL("https://wa.me/9720526327537/?text=Hi! I Came From Pantry Recepies")}} underlayColor="white" style={{borderRadius:50}}>
                <Image style={{width:50, height:50, marginHorizontal:15, top:2}} source={require('../assets/whatsapp-logo.png')}/>
            </TouchableHighlight>
            </View>
            <View style={{flex:1, flexDirection:"row"}}>
                <Text style={{marginHorizontal:15, left:10, bottom:20}}>SMS</Text>
                <Text style={{marginHorizontal:15, left:17, bottom:20}}>Gmail</Text>
                <Text style={{marginHorizontal:15, left:10, bottom:20}}>WhatsApp</Text>
            </View>
            <Text style={styles.filtering}>Filtering  <Icon type="FontAwesome" name="info-circle" style={{fontSize:20, color: "grey"}}
            onPress={()=>{
                Alert.alert(
                    "Filtering",
                    "On - Recepies Will Be Filtered By Your Ingredients.\n"+
                    "Off - Showing All Recepies.",
                    [
                      {
                        text: "OK"
                      }
                    ],
                    { cancelable: true }
                  );
            }}/></Text>
            <Switch value={filtering} style={{bottom:50}} onValueChange={async(value)=>{
                setFiltering(value)
                await AsyncStorage.setItem(FILTERING_KEY, value ? "true" : "false")
                }}/>
            <Text style={{fontSize:22,
        fontFamily:"sans-serif-thin",
        textAlign:"center",
        borderBottomWidth:1,
        marginHorizontal:10,
        bottom:40,}}>Signed In As: {currentUser ? currentUser.email : ""}</Text>
            <Button disabled={signOutDisabled} style={styles.SignOutBtn} rounded dark onPress={()=>{
                Alert.alert(
                    "Are You Sure?",
                    "Sign Out?",
                    [
                      {
                        text: "Close"
                      },
                      { text: "Sign Out", onPress: () => {
                        setSignOutDisabled(true)
                        ScanFingerPrintOrSignOut()
                      }}
                    ],
                    { cancelable: true }
                  );
            }}>
            <Text style={styles.SignOutBtnText}>Sign Out</Text>
            </Button>
        </View>    
    )
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
    title:{
        fontSize:22,
        fontFamily:"sans-serif-thin",
        textAlign:"center",
        borderBottomWidth:1,
        marginHorizontal:10,
        paddingBottom:5
    },
    filtering:{
        fontSize:22,
        fontFamily:"sans-serif-thin",
        textAlign:"center",
        borderBottomWidth:1,
        marginHorizontal:10,
        paddingBottom:5,
        bottom:60
    },
    SignOutBtn: {
        flex: 1,
        width:200,
        justifyContent:"center",
        bottom:30,
        marginLeft: "auto",
        marginRight:"auto"
    },
    container: {
        flex: 1,
        alignItems:"center",
        top:10
    },
    SignOutBtnText:{
        color:"white",
        fontSize:22,
        fontFamily:"sans-serif-thin",
    },
    numberPicker:{
        marginVertical:20
    },
    MustContainList:{
        height:200
    },
    checkBox: {
        alignSelf:"flex-end",
        bottom:10,
        left:40,
    },
    item: {
        backgroundColor: '#eeeeee',
        alignItems:"baseline",
        borderWidth:1,
        borderRadius:25,
        borderColor:"#aaaaaa",
        paddingHorizontal: 50,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    ingredientName: {
        fontSize: 20,
        alignSelf:"center",
        bottom:35,
        left:20,
        fontFamily:"sans-serif-thin",
        fontWeight:"bold"
    },
    searchBar:{
      borderRadius: 25,
      borderColor: '#333'
    },
    searchBarContainer:{
      backgroundColor: '#f3f3f3',
      padding: 5,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });