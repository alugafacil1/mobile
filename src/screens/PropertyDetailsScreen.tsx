import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Property } from '../types/property';
import { useAuth } from "../lib/auth/AuthContext";
import { ref, push, serverTimestamp } from "firebase/database";
import { db } from "../lib/firebaseConfig";

const { width } = Dimensions.get('window');

interface PropertyDetailsScreenProps {
  route: {
    params: {
      property: Property;
    };
  };
  navigation: any;
}

export default function PropertyDetailsScreen({ route, navigation }: PropertyDetailsScreenProps) {

  const { property } = route.params;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<FlatList>(null);
  const { user } = useAuth();
  const photos =
    property.photoUrls && property.photoUrls.length > 0
      ? property.photoUrls
      : ['https://via.placeholder.com/400x200'];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentImageIndex(index);
  };

  const price = property.priceInCents ? property.priceInCents / 100 : 0;

  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);

  const renderCarouselImage = ({ item }: { item: string }) => (
    <View style={styles.carouselItemContainer}>
      <Image source={{ uri: item }} style={styles.carouselImage} />
    </View>
  );

  const renderIndicator = (index: number) => (
    <View
      key={index}
      style={[
        styles.indicator,
        index === currentImageIndex && styles.indicatorActive,
      ]}
    />
  );

async function startChat(){

  if(!user?.user_id) return

  const otherUserId = property.ownerId

  const roomId = [otherUserId, user.user_id]
    .sort()
    .join("_")

  const text = message.trim()

  if(!text) return

  const msgsRef = ref(db, `chats/${roomId}/messages`)

  await push(msgsRef,{
    text,
    senderId: user.user_id,
    senderName: user.name,
    timestamp: serverTimestamp()
  })

  setMessage("")

  navigation.navigate("Chat",{
    roomId,
    otherUserId
  })

}
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.carouselContainer}>
        <FlatList
          ref={scrollRef}
          data={photos}
          renderItem={renderCarouselImage}
          keyExtractor={(_, index) => String(index)}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          onScroll={handleScroll}
          showsHorizontalScrollIndicator={false}
        />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.favorite}>
          <Ionicons name="heart-outline" size={22} color="#fff" />
        </TouchableOpacity> */}

        <View style={styles.indicators}>
          {photos.map((_, index) => renderIndicator(index))}
        </View>
      </View>

      <View style={styles.content}>

        <Text style={styles.type}>
          Apartamento • Aluguel
        </Text>

        <Text style={styles.address}>
          {property.address?.street}, {property.address?.number} - {property.address?.city}
        </Text>

        <View style={styles.priceTable}>

          <View style={styles.row}>
            <Text style={styles.label}>Aluguel</Text>
            <Text>{priceFormatted}</Text>
          </View>

          <View style={styles.rowTotal}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.total}>{priceFormatted}</Text>
          </View>

        </View>

        <View style={styles.features}>

          <View style={styles.feature}>
            <Ionicons name="resize-outline" size={18} color="#2563EB"/>
            <Text style={styles.featureText}>{property.numberOfRooms} Cômodos</Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="bed-outline" size={18} color="#2563EB"/>
            <Text style={styles.featureText}>{property.numberOfBedrooms} Quartos</Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="water-outline" size={18} color="#2563EB"/>
            <Text style={styles.featureText}>{property.numberOfBathrooms} Banheiros</Text>
          </View>

        </View>

        {property.description && (

          <>
            <Text style={styles.sectionTitle}>
              Descrição do imóvel
            </Text>

            <Text style={styles.description}>
              {property.description}
            </Text>

          </>
        )}

          {!showInterestForm && (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowInterestForm(true)}
            >
              <Text style={styles.buttonText}>
                Tenho interesse
              </Text>
            </TouchableOpacity>
          )}

          {showInterestForm && (
            <View style={styles.interestContainer}>

              <View style={styles.interestHeader}>
                <Text style={styles.interestTitle}>Tenho interesse</Text>

                <TouchableOpacity onPress={() => setShowInterestForm(false)}>
                  <Text style={{ fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Nome do Responsável</Text>

              <View style={styles.inputDisabled}>
                <Text style={{ color: "#fff" }}>
                  {user?.name}
                </Text>
              </View>

              <Text style={styles.label}>Mensagem</Text>

              <TextInput
                style={styles.textArea}
                placeholder="Mensagem"
                multiline
                value={message}
                onChangeText={setMessage}
              />

              <TouchableOpacity style={styles.chatButton} onPress={startChat}>
                <Text style={styles.chatButtonText}>
                  Iniciar chat
                </Text>
              </TouchableOpacity>

            </View>
        )}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#F3F4F6"
},

carouselContainer:{
position:"relative",
height:260
},

carouselItemContainer:{
width:width
},

carouselImage:{
width:width,
height:260,
resizeMode:"cover"
},

indicators:{
position:"absolute",
bottom:12,
left:0,
right:0,
flexDirection:"row",
justifyContent:"center"
},

indicator:{
width:8,
height:8,
borderRadius:4,
backgroundColor:"rgba(255,255,255,0.5)",
marginHorizontal:4
},

indicatorActive:{
backgroundColor:"#fff",
width:10,
height:10
},

favorite: {
  position: "absolute",
  top: 45,
  right: 20,
  padding: 8,
  borderRadius: 20,
},

content:{
backgroundColor:"#fff",
marginTop:-20,
borderTopLeftRadius:20,
borderTopRightRadius:20,
padding:16
},

type:{
fontSize:12,
color:"#6B7280",
marginBottom:4
},

address:{
fontSize:16,
fontWeight:"bold",
color:"#2563EB",
marginBottom:14
},

priceTable:{
borderTopWidth:1,
borderBottomWidth:1,
borderColor:"#E5E7EB",
paddingVertical:10,
marginBottom:16
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:6
},

rowTotal:{
flexDirection:"row",
justifyContent:"space-between"
},

label:{
color:"#6B7280"
},

total:{
fontWeight:"bold",
color:"#2563EB"
},

features:{
flexDirection:"row",
justifyContent:"space-around",
marginBottom:20
},

feature:{
alignItems:"center"
},

featureText:{
fontSize:12,
marginTop:4
},

sectionTitle:{
fontWeight:"bold",
marginBottom:6,
color: "#2563EB"
},

description:{
color:"#6B7280",
lineHeight:20,
marginBottom:20
},

button:{
backgroundColor:"#2563EB",
padding:14,
borderRadius:6,
alignItems:"center"
},

buttonText:{
color:"#fff",
fontWeight:"bold"
},

backButton: {
  position: "absolute",
  top: 45,
  left: 16,
},

interestContainer:{
marginTop:20,
backgroundColor:"#fff",
padding:16,
borderRadius:8
},

interestHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:16
},

interestTitle:{
fontSize:16,
color:"#2563EB",
fontWeight:"bold"
},

inputDisabled:{
backgroundColor:"#4F8FE6",
padding:10,
borderRadius:4,
marginBottom:16
},

textArea:{
borderWidth:1,
borderColor:"#3B82F6",
borderRadius:4,
height:120,
padding:10,
textAlignVertical:"top",
marginBottom:20
},

chatButton:{
backgroundColor:"#4F8FE6",
padding:12,
alignItems:"center",
borderRadius:4
},

chatButtonText:{
color:"#fff",
fontWeight:"bold"
},
});