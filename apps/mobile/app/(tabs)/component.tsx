import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import CustomButton from '@/components/ui/atoms/Button';
import { ThemedText } from '@/components/ThemedText';
import CustomInput from '@/components/ui/atoms/Inputs';
import InputWrapper from '@/components/InputWrapper';
import PhoneInput from '@/components/ui/atoms/PhoneInput';
import ZipCodeInput from '@/components/ui/atoms/ZipcodeInput';
import DateOfBirthInput from '@/components/ui/atoms/DOBInput';
import Checkbox from '@/components/ui/atoms/Checkbox';
import SearchField from '@/components/ui/atoms/Search';
import Dropdown from '@/components/ui/atoms/dropdown';
import CustomSelect from '@/components/ui/atoms/dropdown';
import Card from '@/components/ui/molecules/Card';
import EventCardContainer from '@/components/ui/molecules/EventCard/SpotlightEvent/SpotlightContainer';
import NotificationCard from '@/components/ui/molecules/NotificationCard';
import UserAvatar from '@/components/ui/organisms/Sidemenu';
import CodeInput from '@/components/ui/organisms/TeamCode';

export default function ComponentsScreen() {
  return (
    <InputWrapper>
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.container}>
            <ThemedText type="title">🧪 UI Components Test</ThemedText>
            {/* <UserAvatar firstName="Gunnar" lastName="Smith" /> */}

            <CustomButton
              title="Test Button"
              onPress={() => alert('Button Clicked!')}
            />
            <CustomButton
              title="Cancel"
              variant="secondary"
              onPress={() => alert('Canceled!')}
            />
            <CustomButton
              title="Delete"
              variant="danger"
              onPress={() => alert('Deleted!')}
            />
            <CustomButton
              variant="icon"
              iconName="search"
              onPress={() => alert('Searching!')}
            />
            <CustomButton
              title="Full Width Button"
              fullWidth
              onPress={() => alert('Button Clicked!')}
            />

            <ThemedView style={styles.inputContainer}>
              <CustomInput label="Full Name" variant="name" />
              <CustomInput
                label="Email"
                variant="email"
                keyboardType="email-address"
              />
              <CustomInput
                label="Password"
                variant="password"
                secureTextEntry
              />
              <PhoneInput
                onChangeText={(value) => console.log('Phone:', value)}
              />
              <ZipCodeInput
                onChangeText={(value) => console.log('Zip Code:', value)}
              />
              <DateOfBirthInput
                onChangeText={(date) => console.log('DOB:', date)}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <CustomSelect
                label="Select a Role"
                options={[
                  { label: 'Player', value: 'Player' },
                  { label: 'Coach', value: 'Coach' },
                  { label: 'Fan', value: 'Fan' },
                ]}
                onSelect={(value) => console.log('Selected Role:', value)}
              />
              {/* <Checkbox
                label="College Commitment"
                onChange={(checked) => console.log("Checked:", checked)}
              /> */}

              {/* <SearchField
                onSearch={(query) => console.log('Searching for:', query)}
              /> */}
            </ThemedView>
            <ThemedView style={styles.inputContainer}>
              <Card type="info" title="2045 Tree Meadow Ave" />
              {/* <Card
                type="quickAction"
                title="Payments"
                icon={require('@/assets/images/react-logo.png')}
                onPress={() => alert('Payments Clicked!')}
              /> */}
              <Card
                type="groupChat"
                title="Texas Bombers 16U"
                additionalInfo="25 Members"
                onPress={() => console.log('Open Group Chat')}
              />
              <Card
                type="trophy"
                image={require('@/assets/images/react-logo.png')}
              />
              <NotificationCard />
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 10,
                }}
              >
                <ThemedText style={{ fontSize: 18, marginBottom: 10 }}>
                  Enter Verification Code
                </ThemedText>
                {/* <CodeInput
                  onComplete={(code) => console.log('Entered Code:', code)}
                /> */}
              </View>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </InputWrapper>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  inputContainer: {
    marginTop: 10,
    width: '100%',
  },
});
