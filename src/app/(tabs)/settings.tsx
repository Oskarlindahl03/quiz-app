import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ff3b30',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 