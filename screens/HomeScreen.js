import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [groupName, setGroupName] = useState('');
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadGroups);
    return unsubscribe;
  }, [navigation]);

  const loadGroups = async () => {
    const data = await AsyncStorage.getItem('musGroups');
    if (data) setGroups(JSON.parse(data));
  };

  const addGroup = async () => {
    if (!groupName || groups.includes(groupName)) return;
    navigation.navigate('AñadirJugadores', { groupName });
    setGroupName('');
  };

  const deleteGroup = async (name) => {
    Alert.alert(
      '¿Eliminar grupo?',
      `¿Estás seguro de que quieres eliminar el grupo "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const newGroups = groups.filter(group => group !== name);
            await AsyncStorage.setItem('musGroups', JSON.stringify(newGroups));
            await AsyncStorage.removeItem(`data-${name}`);
            setGroups(newGroups);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis grupos de Mus</Text>

      <TextInput
        placeholder="Nombre del grupo (ej: mus1)"
        value={groupName}
        onChangeText={setGroupName}
        style={styles.input}
      />

      <Button title="Crear grupo" onPress={addGroup} />

      <FlatList
        data={groups}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            <Button
              title={item}
              onPress={() => navigation.navigate('Grupo', { name: item })}
            />
            <TouchableOpacity onPress={() => deleteGroup(item)}>
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 10, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  deleteText: {
    fontSize: 18,
    color: 'black',
    paddingHorizontal: 10,
  },
});
