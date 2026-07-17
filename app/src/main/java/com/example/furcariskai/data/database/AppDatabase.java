package com.example.furcariskai.data.database;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import com.example.furcariskai.data.dao.AppDao;
import com.example.furcariskai.data.model.*;

@Database(entities = {
        Patient.class,
        Appointment.class,
        MedicalHistory.class,
        ClinicalMeasurement.class,
        XRayImage.class,
        ScanResult.class,
        Treatment.class,
        Report.class,
        Notification.class
}, version = 1, exportSchema = false)
public abstract class AppDatabase extends RoomDatabase {
    private static volatile AppDatabase INSTANCE;

    public abstract AppDao appDao();

    public static AppDatabase getDatabase(final Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(context.getApplicationContext(),
                                    AppDatabase.class, "furcarisk_database")
                            .fallbackToDestructiveMigration()
                            .build();
                }
            }
        }
        return INSTANCE;
    }
}
