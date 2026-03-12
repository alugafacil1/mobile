import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../lib/auth/AuthContext";

import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebaseConfig";
import {getUserById} from "../services/userService";

export default function ChatListScreen() {

  const navigation = useNavigation();
  const { user } = useAuth();
  const userId = user?.user_id;

  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(() => {

    if (!userId) return;

    const chatsRef = ref(db, "chats");

    const unsubscribe = onValue(chatsRef, async (snapshot) => {

    const data = snapshot.val();

    if (!data) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const list = await Promise.all(
      Object.keys(data)
        .filter((roomId) => roomId.includes(userId))
        .map(async (roomId) => {

          const messages = data[roomId]?.messages || {};

          const messagesArray = Object.entries(messages).map(([id, msg]: any) => ({
            id,
            ...msg
          }));

          messagesArray.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

          const lastMessage = messagesArray[messagesArray.length - 1];

          const otherUserId = roomId.split("_").find(id => id !== userId);
         
          const otherUser = await getUserById(otherUserId);

          return {
            roomId,
            otherUserId,
            lastMessage: lastMessage?.text || "",
            timestamp: lastMessage?.timestamp || 0,
            otherUserName: otherUser?.name || ""
          };

        })
    );

    setConversations(list.sort((a, b) => b.timestamp - a.timestamp));
    setLoading(false);

  });
    return () => unsubscribe();

  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = loadConversations();
      return () => unsubscribe && unsubscribe();
    }, [loadConversations])
  );

  const filtered = conversations.filter((c: any) =>
    c.otherUserName?.toLowerCase().includes(search.toLowerCase())
  );

  function formatTime(timestamp) {

    if (!timestamp) return ""

    const date = new Date(timestamp)

    const hours = String(date.getHours()).padStart(2,"0")
    const minutes = String(date.getMinutes()).padStart(2,"0")

    return `${hours}:${minutes}`
  }

  const renderItem = ({ item }: any) => {

  return (

    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.getParent()?.navigate("Chat", {
          roomId: item.roomId,
          otherUserName: item.otherUserName
        })
      }
    >

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.otherUserName.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.chatContent}>

        <Text style={styles.name}>
          {item.otherUserName}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.message}
        >
          {item.lastMessage || "Sem mensagens"}
        </Text>

      </View>

      <View style={styles.rightSide}>

        <Text style={styles.time}>
          {formatTime(item.timestamp)}
        </Text>

      </View>

    </TouchableOpacity>

  )

}

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (

    <View style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Chats
        </Text>

        <Ionicons name="chatbubble" size={22} color="#fff" />

      </View>

      <View style={styles.searchContainer}>

        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TouchableOpacity onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    <Text>Sair do App</Text>
                  </TouchableOpacity>
        <TextInput
          placeholder="Pesquisar"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.roomId}
        renderItem={renderItem}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB"
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  header: {
    height: 50,
    paddingHorizontal: 16,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 14
  },

  searchInput: {
    marginLeft: 8,
    flex: 1
  },

  chatItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center"
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center"
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold"
  },

  chatContent: {
    marginLeft: 12,
    flex: 1
  },

  name: {
    fontWeight: "600",
    fontSize: 15
  },

  message: {
    color: "#6B7280",
    marginTop: 4
  },
  rightSide:{
  alignItems:"flex-end"
},

time:{
  fontSize:12,
  color:"#6B7280"
}

});