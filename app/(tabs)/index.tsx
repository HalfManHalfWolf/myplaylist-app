import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons'; // For Expo (or import Icon for React Native CLI)

// Define the type for a song
type Song = {
  id: string;
  songName: string;
  artist: string;
};

type Playlist = {
  name: string;
  songs: Song[];
};

export default function PlaylistScreen() {
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<Playlist[]>([]);
  const [playlistName, setPlaylistName] = useState('');

  // Load saved playlists on app start
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const saved = await AsyncStorage.getItem('playlists');
        if (saved) setSavedPlaylists(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved playlists:', e);
      }
    };
    loadPlaylists();
  }, []);

  // Save playlist every time it changes
  useEffect(() => {
    const savePlaylists = async () => {
      try {
        await AsyncStorage.setItem('playlists', JSON.stringify(savedPlaylists));
      } catch (e) {
        console.error('Failed to save playlists:', e);
      }
    };
    savePlaylists();
  }, [savedPlaylists]);

  const addSong = () => {
    if (songName && artist) {
      setPlaylist(prev => [...prev, { id: Date.now().toString(), songName, artist }]);
      setSongName('');
      setArtist('');
    }
  };

  const deleteSong = (id: string) => {
    setPlaylist(prev => prev.filter(song => song.id !== id));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  const savePlaylist = () => {
    if (!playlistName) {
      Alert.alert('Error', 'Please enter a playlist name.');
      return;
    }

    const newPlaylist = {
      name: playlistName,
      songs: [...playlist],
    };

    // Add to saved playlists
    setSavedPlaylists(prev => [...prev, newPlaylist]);
    setPlaylist([]);
    setPlaylistName('');
  };

  const loadSavedPlaylist = (savedPlaylist: Playlist) => {
    // Load the saved playlist
    setPlaylist(savedPlaylist.songs);
    setSavedPlaylists(prev => prev.filter(p => p.name !== savedPlaylist.name)); // Optionally remove from saved
  };

  const deleteSavedPlaylist = (playlistName: string) => {
    setSavedPlaylists(prev => prev.filter(p => p.name !== playlistName));
  };

  const renderItem = ({ item }: { item: Song }) => (
    <View style={styles.songItem}>
      <FontAwesome name="music" size={20} color="#fff" />
      <Text style={styles.songText}>{item.songName} - {item.artist}</Text>
      <FontAwesome
        name="trash"
        size={20}
        color="red"
        onPress={() => deleteSong(item.id)}
      />
    </View>
  );

  const renderSavedPlaylistItem = ({ item }: { item: Playlist }) => (
    <View style={styles.savedItem}>
      <Text style={styles.savedText}>{item.name}</Text>
      <TouchableOpacity onPress={() => loadSavedPlaylist(item)}>
        <Text style={styles.actionText}>Load</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteSavedPlaylist(item.name)}>
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calipha's Playlist Maker</Text>

      <TextInput
        placeholder="Song Name"
        value={songName}
        onChangeText={setSongName}
        style={styles.input}
      />

      <TextInput
        placeholder="Artist"
        value={artist}
        onChangeText={setArtist}
        style={styles.input}
      />

      <Button title="Add to Playlist" onPress={addSong} color="#3B3B3B" />

      <Button title="Clear Playlist" onPress={clearPlaylist} color="red" />

      {/* Save Playlist Section */}
      <TextInput
        placeholder="Enter Playlist Name"
        value={playlistName}
        onChangeText={setPlaylistName}
        style={styles.input}
      />

      <Button title="Save Playlist" onPress={savePlaylist} color="green" />

      <FlatList
        data={playlist}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      <Text style={styles.subtitle}>Saved Playlists:</Text>
      <FlatList
        data={savedPlaylists}
        renderItem={renderSavedPlaylistItem}
        keyExtractor={(item) => item.name}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    marginTop: 50, 
    backgroundColor: '#000', // Black background
  },
  title: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 20, 
    color: '#fff', 
    marginBottom: 10, 
    marginTop: 30,
  },
  input: { 
    borderWidth: 1, 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 5, 
    borderColor: '#ddd', 
    backgroundColor: '#333', 
    color: '#fff',
  },
  list: { 
    marginTop: 20, 
    backgroundColor: '#333', 
    borderRadius: 10, 
    padding: 10,
  },
  songItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderColor: '#444',
  },
  songText: { 
    flex: 1, 
    marginLeft: 10, 
    marginRight: 10, 
    fontSize: 16, 
    color: '#fff' 
  },
  savedItem: { 
    padding: 10, 
    marginTop: 10, 
    backgroundColor: '#444', 
    borderRadius: 5 
  },
  savedText: { 
    fontSize: 16, 
    color: '#fff' 
  },
  actionText: { 
    fontSize: 14, 
    color: '#00bcd4', 
    marginTop: 5,
  },
});
