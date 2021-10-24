import 'react-native-gesture-handler';
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native'
import { Button, Icon, Input, Item } from 'native-base';
import {useAuth} from '../Context/AuthContext'

export default function Login({navigation}) {
    const [email, updateEmail] = useState("")
    const [pass, updatePass] = useState("")
    const {login, currentUser} = useAuth()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [HidePass, setHidePass] = useState(true)
    async function handleLogin()
    {
        try{
            setError("")
            setLoading(true)
            await login(email, pass)
            navigation.navigate("Settings")
        } catch(e){
            setError("Failed To Log In\n"
            +e)
            setLoading(false)
        }
      
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.appHeaderText}>Login</Text>
            <Text style={styles.errorText}>{error}</Text>
          <Item style={styles.item}>
            <Input style={styles.InputPlaceHolderText} placeholder='Email' keyboardType="email-address" onChangeText={(value)=>updateEmail(value)}/>
            <Icon active type="FontAwesome" name='envelope-o' />
          </Item>
          <Item style={styles.item}>
            <Input style={styles.InputPlaceHolderText} placeholder='Password' secureTextEntry={HidePass} onChangeText={(value)=>updatePass(value)}/>
            <Icon active type="FontAwesome" name={HidePass ? 'eye' : 'eye-slash'} onPress={()=>setHidePass(!HidePass)} />
          </Item>
          <Button disabled={loading} rounded dark style={styles.loginBtn} onPress={handleLogin}>
                <Text style={styles.LoginBtnText}>Login</Text>
          </Button>
                <Text style={styles.SignUpText}>Don't Have An Account?
                  <Text onPress={()=>{navigation.navigate("SignUp")}}style={styles.SignUpLinkText}>
                  Sign Up!</Text>
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
  loginBtn: {
    flex:1,
    width:200,
    justifyContent:"center",
    marginTop: 20,
    marginLeft: "auto",
    marginRight:"auto"
  },
  LoginBtnText:{
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
  SignUpLinkText:{
    color:"#03a1fc",
    textDecorationLine: "underline"
  },
  SignUpText:{
    color:"black",
    fontFamily:"sans-serif-thin",
    fontSize:20,
    marginTop:20
  },
});