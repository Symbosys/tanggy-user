import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';

// Register the sheet component with id 'always-open'
const AlwaysOpenSheet = () => {
    return (
        <ActionSheet
            id="always-open"
            // Prevent closing by backdrop/back button so it stays visible
            closable={false}
            // keep header visible (optional)
            headerAlwaysVisible={true}
            // optionally set container height / snap points
            containerStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            gestureEnabled={true}
        >
            {/* Your sheet UI here — using your Sheet component */}
            <View style={styles.container}>
                <Text style={styles.title}>Always Open Sheet</Text>

                {/* Use the Sheet UI you posted */}
                <View style={styles.sheetBox}>
                    <Text style={styles.sheetText}>This is your sheet content.</Text>
                </View>

                {/* Example: a button to programmatically hide it (if you want) */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                        // If you ever want to close it programmatically, call:
                        // SheetManager.hide('always-open');
                        // But since closable={false}, hide() is required to close
                        SheetManager.hide('always-open');
                    }}>
                    <Text style={styles.closeText}>Hide sheet</Text>
                </TouchableOpacity>
            </View>
        </ActionSheet>
    );
};

export default AlwaysOpenSheet;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        minHeight: 220,
        alignItems: 'center',
    },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
    sheetBox: {
        width: '100%',
        padding: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        marginBottom: 12,
    },
    sheetText: { textAlign: 'center' },
    closeButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#2563eb',
    },
    closeText: { color: 'white', fontWeight: '600' },
});