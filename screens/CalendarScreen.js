import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Image,
    Animated,
    Platform,
    Dimensions
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Configuration des locales pour le calendrier
LocaleConfig.locales['fr'] = {
    monthNames: [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    today: 'Aujourd\'hui'
};
LocaleConfig.locales['ar'] = {
    monthNames: [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
        'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
    ],
    monthNamesShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'غشت', 'شت', 'أكت', 'نون', 'دجن'],
    dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    dayNamesShort: ['أحد', 'إثن', 'ثلث', 'أرب', 'خمس', 'جمع', 'سبت'],
    today: 'اليوم'
};
LocaleConfig.defaultLocale = 'ar';

// Listes des médecins et spécialités
const doctors = [
    {
        id: 1,
        name: 'Dr. Benali',
        specialty: 'Cardiologie',
        photo: require('../assets/doctor1.png'),
        availability: ['9:00', '10:00', '11:00', '14:00', '15:00']
    },
    {
        id: 2,
        name: 'Dr. Hakim',
        specialty: 'Pédiatrie',
        photo: require('../assets/doctor2.png'),
        availability: ['8:30', '9:30', '13:00', '16:00']
    },
    {
        id: 3,
        name: 'Dr. Amrani',
        specialty: 'Dermatologie',
        photo: require('../assets/doctor3.png'),
        availability: ['10:30', '11:30', '14:30', '15:30', '16:30']
    },
    {
        id: 4,
        name: 'Dr. Tazi',
        specialty: 'Gynécologie',
        photo: require('../assets/doctor4.png'),
        availability: ['9:00', '10:00', '14:00', '16:00', '17:00']
    }
];

const specialties = [
    'طب القلب',
    'طب الأطفال',
    'الأمراض الجلدية',
    'أمراض النساء',
    'طب العيون',
    'طب الأعصاب',
    'جراحة العظام',
    'الطب النفسي'
];

const hospitals = [
    { id: 1, name: 'مستشفى الشيخ خليفة', address: 'الدار البيضاء' },
    { id: 2, name: 'مستشفى ابن سينا', address: 'الرباط' },
    { id: 3, name: 'عيادة عين برجة', address: 'الدار البيضاء' },
    { id: 4, name: 'المركز الاستشفائي محمد السادس', address: 'مراكش' }
];

// Types d'appointements
const appointmentTypes = [
    { id: 'checkup', name: 'فحص روتيني', color: '#3498db', icon: 'stethoscope' },
    { id: 'followup', name: 'متابعة طبية', color: '#2ecc71', icon: 'clipboard-check' },
    { id: 'urgent', name: 'استشارة عاجلة', color: '#e74c3c', icon: 'alert-circle' },
    { id: 'specialist', name: 'اختصاصي', color: '#9b59b6', icon: 'account-heart' },
    { id: 'labwork', name: 'تحاليل', color: '#f39c12', icon: 'test-tube' },
    { id: 'imaging', name: 'تصوير طبي', color: '#1abc9c', icon: 'radioactive' }
];

export default function CalendarScreen({ navigation, route }) {
    const [selected, setSelected] = useState('');
    const [markedDates, setMarkedDates] = useState({});
    const [appointments, setAppointments] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date(),
        time: new Date(),
        title: '',
        description: '',
        doctorId: doctors[0].id,
        hospitalId: hospitals[0].id,
        type: appointmentTypes[0].id,
        reminder: '1 day'
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [specialty, setSpecialty] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState(doctors);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [currentMonth, setCurrentMonth] = useState('');

    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const windowWidth = Dimensions.get('window').width;

    // Vérifier si on doit montrer le formulaire d'ajout (route param)
    useEffect(() => {
        if (route.params?.showAppointment) {
            const formDataUpdate = { ...formData };

            if (route.params?.location) {
                const hospital = hospitals.find(h => h.name === route.params.location);
                if (hospital) {
                    formDataUpdate.hospitalId = hospital.id;
                }
            }

            setFormData(formDataUpdate);
            setModalVisible(true);
        }
    }, [route.params]);

    useEffect(() => {
        // Charger les rendez-vous (simulé)
        const today = new Date();
        const todayString = formatDate(today);
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowString = formatDate(tomorrow);
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const nextWeekString = formatDate(nextWeek);

        // Rendez-vous simulés
        const mockAppointments = [
            {
                id: 1,
                date: todayString,
                time: '10:00',
                title: 'Consultation cardiologie',
                description: 'Suivi trimestriel',
                doctorId: 1,
                hospitalId: 1,
                type: 'checkup',
                reminder: '1 day'
            },
            {
                id: 2,
                date: tomorrowString,
                time: '14:30',
                title: 'Analyse sanguine',
                description: 'À jeun',
                doctorId: 3,
                hospitalId: 1,
                type: 'labwork',
                reminder: '1 day'
            },
            {
                id: 3,
                date: nextWeekString,
                time: '09:15',
                title: 'Suivi dermatologique',
                description: 'Traitement acné',
                doctorId: 3,
                hospitalId: 2,
                type: 'followup',
                reminder: '2 hours'
            }
        ];

        setAppointments(mockAppointments);

        // Marquer les dates avec des rendez-vous
        const marked = {};
        mockAppointments.forEach(apt => {
            const type = appointmentTypes.find(t => t.id === apt.type);
            marked[apt.date] = {
                marked: true,
                dotColor: type?.color || '#3498db',
                selectedColor: type?.color || '#3498db'
            };
        });
        setMarkedDates(marked);
        setSelected(todayString);

        // Configurer les notifications pour les rendez-vous
        registerForPushNotificationsAsync();
        schedulePushNotifications(mockAppointments);
    }, []);

    // Filtrer les médecins par spécialité
    useEffect(() => {
        if (specialty) {
            setFilteredDoctors(doctors.filter(doc => doc.specialty === specialty));
        } else {
            setFilteredDoctors(doctors);
        }
    }, [specialty]);

    // Mettre à jour les créneaux horaires disponibles quand le médecin change
    useEffect(() => {
        if (formData.doctorId) {
            const doctor = doctors.find(d => d.id === formData.doctorId);
            if (doctor) {
                setAvailableTimes(doctor.availability);

                // Générer des créneaux horaires
                const slots = doctor.availability.map(time => ({
                    id: `${doctor.id}-${time}`,
                    time,
                    available: Math.random() > 0.3 // Simulation de disponibilité
                }));

                setTimeSlots(slots);
            }
        }
    }, [formData.doctorId]);

    // Animation pour le formulaire
    useEffect(() => {
        if (modalVisible) {
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start();
        }
    }, [modalVisible]);

    // Animation pour les détails
    useEffect(() => {
        if (detailModalVisible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [detailModalVisible]);

    const registerForPushNotificationsAsync = async () => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission refusée', 'Vous ne recevrez pas de notifications pour vos rendez-vous.');
                    return;
                }
            }
        } catch (error) {
            console.log('Erreur lors de l\'enregistrement des notifications:', error);
        }
    };

    const schedulePushNotifications = async (appointments) => {
        try {
            // Annuler toutes les notifications existantes
            await Notifications.cancelAllScheduledNotificationsAsync();

            // Programmer de nouvelles notifications pour chaque rendez-vous
            for (const appointment of appointments) {
                const [year, month, day] = appointment.date.split('-');
                const [hours, minutes] = appointment.time.split(':');

                const appointmentDate = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes));
                const now = new Date();

                if (appointmentDate > now) {
                    // Calculer le délai de rappel
                    let reminderDate = new Date(appointmentDate);

                    if (appointment.reminder === '1 day') {
                        reminderDate.setDate(reminderDate.getDate() - 1);
                    } else if (appointment.reminder === '2 hours') {
                        reminderDate.setHours(reminderDate.getHours() - 2);
                    } else if (appointment.reminder === '30 minutes') {
                        reminderDate.setMinutes(reminderDate.getMinutes() - 30);
                    }

                    if (reminderDate > now) {
                        const doctor = doctors.find(d => d.id === appointment.doctorId);
                        const hospital = hospitals.find(h => h.id === appointment.hospitalId);

                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: 'Rappel de rendez-vous',
                                body: `${appointment.title} avec ${doctor?.name || 'un médecin'} à ${appointment.time} à ${hospital?.name || 'l\'hôpital'}`,
                                sound: true,
                                priority: Notifications.AndroidNotificationPriority.HIGH,
                                data: { appointmentId: appointment.id },
                            },
                            trigger: { date: reminderDate },
                        });
                    }
                }
            }
        } catch (error) {
            console.log('Erreur lors de la programmation des notifications:', error);
        }
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleDayPress = (day) => {
        setSelected(day.dateString);

        // Vibration tactile
        if (Platform.OS === 'ios') {
            Haptics.selectionAsync();
        }
    };

    const handleAddAppointment = () => {
        setFormData({
            ...formData,
            date: new Date(),
            time: new Date(),
            title: '',
            description: '',
            doctorId: doctors[0].id,
            hospitalId: hospitals[0].id,
            type: appointmentTypes[0].id,
            reminder: '1 day'
        });
        setModalVisible(true);
    };

    const handleSaveAppointment = () => {
        if (!formData.title) {
            Alert.alert('Erreur', 'Veuillez saisir un titre pour le rendez-vous');
            return;
        }

        const dateString = formatDate(formData.date);
        const timeString = formatTime(formData.time);

        const newAppointment = {
            id: Date.now().toString(),
            date: dateString,
            time: timeString,
            title: formData.title,
            description: formData.description,
            doctorId: formData.doctorId,
            hospitalId: formData.hospitalId,
            type: formData.type,
            reminder: formData.reminder
        };

        // Ajouter le nouveau rendez-vous
        const updatedAppointments = [...appointments, newAppointment];
        setAppointments(updatedAppointments);

        // Mettre à jour les dates marquées
        const updatedMarkedDates = { ...markedDates };
        const type = appointmentTypes.find(t => t.id === formData.type);
        updatedMarkedDates[dateString] = {
            marked: true,
            dotColor: type?.color || '#3498db',
            selectedColor: type?.color || '#3498db'
        };
        setMarkedDates(updatedMarkedDates);

        // Programmer la notification
        schedulePushNotifications([newAppointment]);

        // Feedback tactile
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        setModalVisible(false);
        setSelected(dateString);

        // Afficher une confirmation
        Alert.alert(
            'Rendez-vous ajouté',
            `Votre rendez-vous a été programmé pour le ${dateString} à ${timeString}`,
            [{ text: 'OK' }]
        );
    };

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setDetailModalVisible(true);
    };

    const handleDeleteAppointment = (id) => {
        Alert.alert(
            'Supprimer le rendez-vous',
            'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        const updatedAppointments = appointments.filter(apt => apt.id !== id);
                        setAppointments(updatedAppointments);

                        // Mettre à jour les dates marquées
                        const updatedMarkedDates = { ...markedDates };
                        const dateToCheck = selectedAppointment.date;

                        if (!updatedAppointments.some(apt => apt.date === dateToCheck)) {
                            delete updatedMarkedDates[dateToCheck];
                        }

                        setMarkedDates(updatedMarkedDates);
                        setDetailModalVisible(false);

                        // Feedback tactile
                        if (Platform.OS === 'ios') {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        }
                    }
                }
            ]
        );
    };

    const renderAppointmentsByDate = () => {
        const filteredAppointments = appointments.filter(apt => apt.date === selected);

        if (filteredAppointments.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="calendar-blank" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>لا يوجد مواعيد في هذا اليوم</Text>
                </View>
            );
        }

        return filteredAppointments.map(appointment => {
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            const hospital = hospitals.find(h => h.id === appointment.hospitalId);
            const type = appointmentTypes.find(t => t.id === appointment.type);

            return (
                <TouchableOpacity
                    key={appointment.id}
                    style={[styles.appointmentCard, { borderLeftColor: type?.color || '#3498db' }]}
                    onPress={() => handleViewAppointment(appointment)}
                >
                    <View style={styles.appointmentHeader}>
                        <MaterialCommunityIcons name={type?.icon || 'calendar'} size={24} color={type?.color || '#3498db'} />
                        <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                    <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                    <View style={styles.appointmentDetails}>
                        <Text style={styles.appointmentDoctor}>{doctor?.name || 'Médecin non spécifié'}</Text>
                        <Text style={styles.appointmentLocation}>{hospital?.name || 'Lieu non spécifié'}</Text>
                    </View>
                </TouchableOpacity>
            );
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>مواعيدي الطبية</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddAppointment}>
                    <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <Calendar
                style={styles.calendar}
                theme={{
                    calendarBackground: '#fff',
                    textSectionTitleColor: '#b6c1cd',
                    selectedDayBackgroundColor: '#3498db',
                    selectedDayTextColor: '#fff',
                    todayTextColor: '#3498db',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#3498db',
                    selectedDotColor: '#fff',
                    arrowColor: '#3498db',
                    monthTextColor: '#3498db',
                    indicatorColor: '#3498db',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 14
                }}
                onDayPress={handleDayPress}
                markedDates={{
                    ...markedDates,
                    [selected]: {
                        ...markedDates[selected],
                        selected: true
                    }
                }}
                onMonthChange={(month) => {
                    setCurrentMonth(`${month.month}/${month.year}`);
                }}
                enableSwipeMonths={true}
            />

            <View style={styles.appointmentsContainer}>
                <Text style={styles.appointmentsTitle}>
                    {selected ? `مواعيد ${selected.split('-').reverse().join('/')}` : 'مواعيد'}
                </Text>
                <ScrollView style={styles.appointmentsList}>
                    {renderAppointmentsByDate()}
                </ScrollView>
            </View>

            {/* Modal d'ajout de rendez-vous */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            transform: [{
                                translateY: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [600, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['#3498db', '#2980b9']}
                        style={styles.modalHeader}
                    >
                        <Text style={styles.modalTitle}>موعد جديد</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <MaterialCommunityIcons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </LinearGradient>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.inputLabel}>العنوان</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(text) => setFormData({...formData, title: text})}
                            placeholder="عنوان الموعد"
                        />

                        <Text style={styles.inputLabel}>الوصف</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({...formData, description: text})}
                            placeholder="وصف (اختياري)"
                            multiline
                        />

                        <Text style={styles.inputLabel}>التاريخ</Text>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <MaterialCommunityIcons name="calendar" size={24} color="#3498db" />
                            <Text style={styles.dateTimeText}>
                                {formatDate(formData.date)}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.date}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setFormData({...formData, date: selectedDate});
                                    }
                                }}
                            />
                        )}

                        <Text style={styles.inputLabel}>الساعة</Text>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <MaterialCommunityIcons name="clock" size={24} color="#3498db" />
                            <Text style={styles.dateTimeText}>
                                {formatTime(formData.time)}
                            </Text>
                        </TouchableOpacity>

                        {showTimePicker && (
                            <DateTimePicker
                                value={formData.time}
                                mode="time"
                                display="default"
                                onChange={(event, selectedTime) => {
                                    setShowTimePicker(false);
                                    if (selectedTime) {
                                        setFormData({...formData, time: selectedTime});
                                    }
                                }}
                            />
                        )}

                        <Text style={styles.inputLabel}>التخصص</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={specialty}
                                onValueChange={(itemValue) => setSpecialty(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="كل التخصصات" value="" />
                                {specialties.map((spec, index) => (
                                    <Picker.Item key={index} label={spec} value={spec} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>الطبيب</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.doctorId}
                                onValueChange={(itemValue) => setFormData({...formData, doctorId: itemValue})}
                                style={styles.picker}
                            >
                                {filteredDoctors.map(doctor => (
                                    <Picker.Item key={doctor.id} label={`${doctor.name} (${doctor.specialty})`} value={doctor.id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>المواعيد المتاحة</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotContainer}>
                            {timeSlots.map(slot => (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[
                                        styles.timeSlot,
                                        selectedTimeSlot === slot.id && styles.selectedTimeSlot,
                                        !slot.available && styles.unavailableTimeSlot
                                    ]}
                                    disabled={!slot.available}
                                    onPress={() => {
                                        setSelectedTimeSlot(slot.id);
                                        const [hours, minutes] = slot.time.split(':');
                                        const newTime = new Date();
                                        newTime.setHours(parseInt(hours));
                                        newTime.setMinutes(parseInt(minutes));
                                        setFormData({...formData, time: newTime});
                                    }}
                                >
                                    <Text style={[
                                        styles.timeSlotText,
                                        selectedTimeSlot === slot.id && styles.selectedTimeSlotText,
                                        !slot.available && styles.unavailableTimeSlotText
                                    ]}>
                                        {slot.time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.inputLabel}>المؤسسة</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.hospitalId}
                                onValueChange={(itemValue) => setFormData({...formData, hospitalId: itemValue})}
                                style={styles.picker}
                            >
                                {hospitals.map(hospital => (
                                    <Picker.Item key={hospital.id} label={`${hospital.name} (${hospital.address})`} value={hospital.id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>نوع الموعد</Text>
                        <View style={styles.typeContainer}>
                            {appointmentTypes.map(type => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.typeButton,
                                        formData.type === type.id && styles.selectedTypeButton,
                                        { borderColor: type.color }
                                    ]}
                                    onPress={() => setFormData({...formData, type: type.id})}
                                >
                                    <MaterialCommunityIcons name={type.icon} size={24} color={type.color} />
                                    <Text style={[
                                        styles.typeText,
                                        formData.type === type.id && { color: type.color }
                                    ]}>
                                        {type.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>تذكير</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.reminder}
                                onValueChange={(itemValue) => setFormData({...formData, reminder: itemValue})}
                                style={styles.picker}
                            >
                                <Picker.Item label="قبل يوم" value="1 day" />
                                <Picker.Item label="قبل ساعتين" value="2 hours" />
                                <Picker.Item label="قبل 30 دقيقة" value="30 minutes" />
                            </Picker>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSaveAppointment}
                        >
                            <Text style={styles.saveButtonText}>حفظ</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </Modal>

            {/* Modal de détail du rendez-vous */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <Animated.View
                    style={[
                        styles.detailModalContainer,
                        { opacity: fadeAnim }
                    ]}
                >
                    {selectedAppointment && (
                        <View style={styles.detailModalContent}>
                            <LinearGradient
                                colors={['#3498db', '#2980b9']}
                                style={styles.detailModalHeader}
                            >
                                <Text style={styles.detailModalTitle}>{selectedAppointment.title}</Text>
                                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </LinearGradient>

                            <View style={styles.detailModalBody}>
                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="calendar" size={24} color="#3498db" />
                                    <Text style={styles.detailText}>
                                        {selectedAppointment.date.split('-').reverse().join('/')} à {selectedAppointment.time}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="doctor" size={24} color="#3498db" />
                                    <Text style={styles.detailText}>
                                        {doctors.find(d => d.id === selectedAppointment.doctorId)?.name || 'Médecin non spécifié'}
                                    </Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <MaterialCommunityIcons name="hospital-building" size={24} color="#3498db" />
                                    <Text style={styles.detailText}>
                                        {hospitals.find(h => h.id === selectedAppointment.hospitalId)?.name || 'Lieu non spécifié'}
                                    </Text>
                                </View>

                                {selectedAppointment.description && (
                                    <View style={styles.detailDescription}>
                                        <Text style={styles.detailDescriptionTitle}>ملاحظات :</Text>
                                        <Text style={styles.detailDescriptionText}>{selectedAppointment.description}</Text>
                                    </View>
                                )}

                                <View style={styles.detailButtonsContainer}>
                                    <TouchableOpacity
                                        style={[styles.detailButton, styles.editButton]}
                                        onPress={() => {
                                            setDetailModalVisible(false);
                                            // Logique pour éditer le rendez-vous
                                        }}
                                    >
                                        <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                                        <Text style={styles.detailButtonText}>تعديل</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.detailButton, styles.deleteButton]}
                                        onPress={() => handleDeleteAppointment(selectedAppointment.id)}
                                    >
                                        <MaterialCommunityIcons name="trash-can" size={20} color="#fff" />
                                        <Text style={styles.detailButtonText}>حذف</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    addButton: {
        backgroundColor: '#3498db',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    calendar: {
        borderRadius: 10,
        elevation: 3,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22
    },
    appointmentsContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 15,
        marginTop: 10
    },
    appointmentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    appointmentsList: {
        flex: 1
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 16
    },
    appointmentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41
    },
    appointmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    appointmentTime: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#333'
    },
    appointmentTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333'
    },
    appointmentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    appointmentDoctor: {
        fontSize: 14,
        color: '#666'
    },
    appointmentLocation: {
        fontSize: 14,
        color: '#666'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff'
    },
    modalContent: {
        padding: 20
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    dateTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9'
    },
    dateTimeText: {
        marginLeft: 10,
        fontSize: 16
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden'
    },
    picker: {
        height: 50
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10
    },
    selectedTypeButton: {
        backgroundColor: '#f0f8ff'
    },
    typeText: {
        marginLeft: 5,
        fontSize: 14
    },
    timeSlotContainer: {
        flexDirection: 'row',
        marginBottom: 15
    },
    timeSlot: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        minWidth: 80,
        alignItems: 'center'
    },
    selectedTimeSlot: {
        backgroundColor: '#3498db',
        borderColor: '#3498db'
    },
    unavailableTimeSlot: {
        backgroundColor: '#f5f5f5',
        borderColor: '#ddd'
    },
    timeSlotText: {
        fontSize: 14,
        color: '#333'
    },
    selectedTimeSlotText: {
        color: '#fff'
    },
    unavailableTimeSlotText: {
        color: '#999'
    },
    saveButton: {
        backgroundColor: '#3498db',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    detailModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    detailModalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden'
    },
    detailModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15
    },
    detailModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff'
    },
    detailModalBody: {
        padding: 20
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    detailText: {
        marginLeft: 10,
        fontSize: 16
    },
    detailDescription: {
        marginTop: 10,
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8
    },
    detailDescriptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5
    },
    detailDescriptionText: {
        fontSize: 16,
        color: '#666'
    },
    detailButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        width: '48%'
    },
    editButton: {
        backgroundColor: '#3498db'
    },
    deleteButton: {
        backgroundColor: '#e74c3c'
    },
    detailButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 16,
        fontWeight: '500'
    }
});

