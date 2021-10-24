import 'react-native-gesture-handler';
import React, {useState} from 'react';
import { StyleSheet, Text, View} from 'react-native'
import { Button, Icon, Input, Item } from 'native-base';
import {useAuth} from '../Context/AuthContext'


export default function SignUp({navigation}) {
    const [email, updateEmail] = useState("")
    const [pass, updatePass] = useState("")
    const [passConfirm, updatePassConfirm] = useState("")
    const {signup, currentUser} = useAuth()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [HidePass, setHidePass] = useState(true)
    const [HidePassConfirm, setHidePassConfirm] = useState(true)
    
    async function handleSubmit()
    {
        if(pass !== passConfirm)
        {
            return setError("Passwords Don't Match")
        }
        try{
            setError("")
            setLoading(true)
            await signup(email, pass)
            navigation.navigate("Settings")
        } catch(e){
            setError(e.message)
            setLoading(false)
        }
    }
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.appHeaderText}>Sign Up</Text>
            <Text style={styles.errorText}>{error}</Text>
          <Item style={styles.item}>
            <Input style={styles.InputPlaceHolderText} placeholder='Email' keyboardType="email-address" onChangeText={(value)=>updateEmail(value)}/>
            <Icon active type="FontAwesome" name='envelope-o' />
          </Item>
          <Item style={styles.item}>
            <Input style={styles.InputPlaceHolderText} placeholder='Password' secureTextEntry={HidePass} onChangeText={(value)=>updatePass(value)}/>
            <Icon active type="FontAwesome" name={HidePass ? 'eye' : 'eye-slash'} onPress={()=>setHidePass(!HidePass)}/>
          </Item>
          <Item style={styles.item}>
            <Input style={styles.InputPlaceHolderText} placeholder='Confirm Password' secureTextEntry={HidePassConfirm} onChangeText={(value)=>updatePassConfirm(value)}/>
            <Icon active type="FontAwesome" name={HidePassConfirm ? 'eye' : 'eye-slash'} onPress={(e)=>setHidePassConfirm(!HidePassConfirm)}/>
          </Item>
          <Button disabled={loading} rounded dark style={styles.SignUpBtn} onPress={handleSubmit}>
                <Text style={styles.SignUpBtnText}>Sign Up</Text>
          </Button>
          <Text style={styles.SignInText}>Already Have An Account?
                  <Text onPress={()=>{navigation.navigate("Login")}}style={styles.SignInLinkText}>
                  Sign In!</Text>
                </Text>
        </View>
      );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    appHeaderText: {
      fontFamily:"sans-serif-thin",
      fontSize:40
    },
    SignUpBtn: {
      flex:1,
      width:200,
      justifyContent:"center",
      marginTop: 20,
      marginLeft: "auto",
      marginRight:"auto"
    },
    SignUpBtnText:{
        color:"white",
        fontSize:22,
        fontFamily:"sans-serif-thin",
    },
    item: {
      width: 300
    },
    InputPlaceHolderText:{
      fontFamily:"sans-serif-thin",
      fontSize:20
    },
    errorText:{
        color:'red'
    },
    SignInLinkText:{
        color:"#03a1fc",
        textDecorationLine: "underline"
      },
    SignInText:{
        color:"black",
        fontFamily:"sans-serif-thin",
        fontSize:20,
        marginTop:20
    },
  });