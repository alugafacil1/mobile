import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    FlatList,
    ActivityIndicator,
    Text,
    StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../lib/auth/AuthContext";
import PropertyCard from "../components/PropertyCard";
import {
    getUserFavorites,
    toggleFavorite,
} from "../services/favoriteService";


export default function FavoritesScreen() {
    const { user } = useAuth();
    const userId = user?.user_id;

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFavorites = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        try {
            const data = await getUserFavorites(userId);

            const mapped = data.map((fav: any) => fav.property);

            setProperties(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const handleRemoveFavorite = async (propertyId: string) => {
        if (!userId) return;

        try {
            await toggleFavorite(userId, propertyId);

            setProperties((prev) =>
                prev.filter((p) => p.propertyId !== propertyId)
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (properties.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.text}>Nenhum imóvel favoritado ainda.</Text>
            </View>
        );
    }


    return (
        <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
            <FlatList
                data={properties}
                keyExtractor={(item) => item.propertyId}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => {
                    const price = item.priceInCents / 100;

                    const priceFormatted = new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(price);

                    return (
                        <PropertyCard
                            propertyId={item.propertyId}
                            image={item.photoUrls?.[0]}
                            address={`${item.address?.street}, ${item.address?.city}`}
                            details={`${item.numberOfBedrooms} Quartos • ${item.numberOfBathrooms} Banheiros`}
                            price={`Aluguel ${priceFormatted}`}
                            total={`Total ${priceFormatted}`}
                            isFavorite={true}
                            onToggleFavorite={handleRemoveFavorite}
                        />
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 16,
        color: "#000000",
    },
});