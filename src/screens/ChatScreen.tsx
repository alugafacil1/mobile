import React, { useState, useEffect, useRef } from "react";
import {
 View,
 Text,
 StyleSheet,
 FlatList,
 TextInput,
 TouchableOpacity,
 KeyboardAvoidingView,
 Platform
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../lib/auth/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";

import { db } from "../lib/firebaseConfig";

import {
 ref,
 push,
 onValue,
 serverTimestamp,
 query,
 orderByChild
} from "firebase/database";


export default function ChatScreen(){

 const navigation:any = useNavigation()
 const route:any = useRoute()
 const { user } = useAuth()

 const flatListRef:any = useRef()

 const [messages,setMessages] = useState<any[]>([])
 const [message,setMessage] = useState("")

const roomId = route?.params?.roomId
const otherUserName = route?.params?.otherUserName


 /* Escuta mensagens */
useEffect(()=>{

 if(!roomId) return

 const msgsRef = query(
  ref(db,`chats/${roomId}/messages`),
  orderByChild("timestamp")
 )

 const unsubscribe = onValue(msgsRef,(snapshot)=>{

  const data = snapshot.val()

  if(!data){
   setMessages([])
   return
  }

  const parsed = Object.entries(data)
   .map(([id,msg]:any)=>({
     id,
     ...msg,
     mine: msg.senderId === user?.user_id
   }))
   .sort((a:any,b:any)=>(a.timestamp || 0) - (b.timestamp || 0))

  setMessages(parsed)

 })

 return ()=>unsubscribe()

},[roomId])



/* Scroll */

useEffect(()=>{

 setTimeout(()=>{
  flatListRef.current?.scrollToEnd({animated:true})
 },100)

},[messages])



/* Enviar mensagem */

async function sendMessage(){

 const text = message.trim()

 if(!text) return

 const msgsRef = ref(db,`chats/${roomId}/messages`)

 await push(msgsRef,{
  text,
  senderId:user.user_id,
  senderName:user.name,
  timestamp:serverTimestamp()
 })

 setMessage("")
}

function formatTime(timestamp){

 if(!timestamp) return ""

 const date = new Date(timestamp)

 const hours = String(date.getHours()).padStart(2,"0")
 const minutes = String(date.getMinutes()).padStart(2,"0")

 return `${hours}:${minutes}`
}

/* Render mensagem */

function renderMessage({item}:any){

 return(

  <View
   style={[
    styles.messageContainer,
    item.mine ? styles.myMessage : styles.otherMessage
   ]}
  >

   <Text
    style={[
     styles.messageText,
     item.mine && {color:"#fff"}
    ]}
   >
    {item.text}
   </Text>

   <Text
    style={[
     styles.time,
     item.mine && {color:"#DBEAFE"}
    ]}
   >
    {formatTime(item.timestamp)}
   </Text>

  </View>

 )
}



return(

 <KeyboardAvoidingView
  style={{flex:1}}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
 >

  <View style={styles.container}>

   <View style={styles.header}>

    <TouchableOpacity 
      onPress={()=>navigation.goBack()}
      style={styles.backButton}
    >
     <Ionicons name="chevron-back" size={24} color="#fff"/>
    </TouchableOpacity>

    <Text style={styles.headerName}>
     {otherUserName}
    </Text>

   </View>


   <FlatList
    ref={flatListRef}
    data={messages}
    keyExtractor={(item)=>item.id}
    renderItem={renderMessage}
    contentContainerStyle={{padding:16}}
   />


   <View style={styles.inputContainer}>

    <TextInput
     value={message}
     onChangeText={setMessage}
     placeholder="Mensagem"
     style={styles.input}
    />

    <TouchableOpacity onPress={sendMessage}>
     <Ionicons name="send" size={22} color="#3B82F6"/>
    </TouchableOpacity>

   </View>

  </View>

 </KeyboardAvoidingView>

 )
}



const styles = StyleSheet.create({

 container:{
  flex:1,
  backgroundColor:"#F3F4F6"
 },

 header:{
  height:60,
  backgroundColor:"#3B82F6",
  justifyContent:"center",
  alignItems:"center"
},

 headerName:{
  color:"#fff",
  fontWeight:"600",
  fontSize:16
 },

 messageContainer:{
  maxWidth:"75%",
  padding:12,
  borderRadius:14,
  marginBottom:10
 },

 myMessage:{
  backgroundColor:"#3B82F6",
  alignSelf:"flex-end"
 },

 otherMessage:{
  borderWidth:1,
  borderColor:"#3B82F6",
  alignSelf:"flex-start"
 },

 messageText:{
  color:"#2563EB"
 },

 inputContainer:{
  flexDirection:"row",
  alignItems:"center",
  padding:10,
  borderTopWidth:1,
  borderColor:"#E5E7EB",
  backgroundColor:"#fff"
 },

 input:{
  flex:1,
  backgroundColor:"#F3F4F6",
  borderRadius:10,
  paddingHorizontal:12,
  height:40,
  marginRight:10
 },
 time:{
 fontSize:11,
 marginTop:4,
 alignSelf:"flex-end",
 color:"#6B7280"
},
backButton:{
  position:"absolute",
  left:16
}

})