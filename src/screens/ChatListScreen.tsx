import React, { useState, useCallback } from 'react'
import {
 View,
 Text,
 StyleSheet,
 FlatList,
 TouchableOpacity,
 TextInput,
 ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { getConversations } from '../services/conversationService'
import { useAuth } from "../lib/auth/AuthContext";

export default function ChatListScreen() {

 const navigation: any = useNavigation()

 const { user } = useAuth()
 const userId = user?.user_id

 const [conversations,setConversations] = useState<any[]>([])
 const [search,setSearch] = useState('')
 const [loading,setLoading] = useState(true)

 const loadConversations = useCallback(async () => {

  if(!userId) return

  setLoading(true)

  try{

   const data = await getConversations(userId)

   setConversations(data)

  }catch(err){

   console.error(err)

  }finally{

   setLoading(false)

  }

 },[userId])

 useFocusEffect(
  useCallback(()=>{
   loadConversations()
  },[loadConversations])
 )

 function getOtherUser(conversation:any){

  if(conversation.initiatorUser?.id === userId){
   return conversation.recipientUser
  }

  return conversation.initiatorUser
 }

 const filtered = conversations.filter((c:any)=>{

  const other = getOtherUser(c)

  if(!other?.name) return false

  return other.name.toLowerCase().includes(search.toLowerCase())

 })

 const renderItem = ({item}:any)=>{

  const otherUser = getOtherUser(item)

  const lastMessage =
   item.messages && item.messages.length > 0
    ? item.messages[item.messages.length-1].content
    : "Sem mensagens"

  return(

   <TouchableOpacity style={styles.chatItem}>

    <View style={styles.avatar}>
     <Text style={styles.avatarText}>
      {otherUser?.name?.charAt(0) ?? "?"}
     </Text>
    </View>

    <View style={styles.chatContent}>

     <Text style={styles.name}>
      {otherUser?.name ?? "Usuário"}
     </Text>

     <Text style={styles.message}>
      {lastMessage}
     </Text>

    </View>

   </TouchableOpacity>

  )

 }

 if(loading){
  return(
   <View style={styles.center}>
    <ActivityIndicator size="large"/>
   </View>
  )
 }

 if(conversations.length === 0){
  return(
   <View style={styles.container}>

    <View style={styles.header}>
     <TouchableOpacity onPress={()=>navigation.goBack()}>
      <Ionicons name="arrow-back" size={22} color="#fff"/>
     </TouchableOpacity>

     <Text style={styles.headerTitle}>Chats</Text>

     <Ionicons name="chatbubble" size={22} color="#fff"/>
    </View>

    <View style={styles.center}>
     <Text>Nenhuma conversa ainda.</Text>
    </View>

   </View>
  )
 }

 return(

  <View style={styles.container}>

   <View style={styles.header}>

    <TouchableOpacity onPress={()=>navigation.goBack()}>
     <Ionicons name="arrow-back" size={22} color="#fff"/>
    </TouchableOpacity>

    <Text style={styles.headerTitle}>
     Chats
    </Text>

    <Ionicons name="chatbubble" size={22} color="#fff"/>

   </View>

   <View style={styles.searchContainer}>

    <Ionicons name="search" size={18} color="#9CA3AF"/>

    <TextInput
     placeholder="Pesquisar"
     value={search}
     onChangeText={setSearch}
     style={styles.searchInput}
    />

   </View>

   <FlatList
    data={filtered}
    keyExtractor={(item:any)=>item.conversationId}
    renderItem={renderItem}
   />

  </View>

 )
}

const styles = StyleSheet.create({

 container:{
  flex:1,
  backgroundColor:'#F9FAFB'
 },

 center:{
  flex:1,
  justifyContent:'center',
  alignItems:'center'
 },

 header:{
  height:50,
  paddingHorizontal:16,
  backgroundColor:"#2563EB",
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-between'
 },

 headerTitle:{
  color:'#fff',
  fontSize:18,
  fontWeight:'bold'
 },

 searchContainer:{
  flexDirection:'row',
  alignItems:'center',
  backgroundColor:'#F3F4F6',
  margin:16,
  paddingHorizontal:12,
  borderRadius:10
 },

 searchInput:{
  marginLeft:8,
  height:40,
  flex:1
 },

 chatItem:{
  flexDirection:'row',
  padding:16,
  alignItems:'center',
  backgroundColor:'#fff'
 },

 avatar:{
  width:48,
  height:48,
  borderRadius:24,
  backgroundColor:'#2563EB',
  justifyContent:'center',
  alignItems:'center'
 },

 avatarText:{
  color:'#fff',
  fontWeight:'bold'
 },

 chatContent:{
  marginLeft:12,
  flex:1
 },

 name:{
  fontWeight:'600',
  fontSize:15
 },

 message:{
  color:'#6B7280'
 }

})