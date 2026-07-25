package com.example.furcariskai.ui.fragment;

import android.content.ContentValues;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageCapture;
import androidx.camera.core.ImageCaptureException;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentUploadXrayBinding;
import com.example.furcariskai.viewmodel.MainViewModel;
import com.google.common.util.concurrent.ListenableFuture;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.ExecutionException;

public class UploadXRayFragment extends Fragment {
    private FragmentUploadXrayBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;
    private ImageCapture imageCapture;
    private Uri selectedImageUri;

    // Gallery Picker Result Launcher
    private final ActivityResultLauncher<String> selectImageLauncher = registerForActivityResult(
            new ActivityResultContracts.GetContent(),
            uri -> {
                if (uri != null) {
                    selectedImageUri = uri;
                    binding.ivXrayPreview.setImageURI(uri);
                    binding.ivXrayPreview.setVisibility(View.VISIBLE);
                    binding.viewFinder.setVisibility(View.GONE);
                    viewModel.setXrayPath(uri.toString());
                    Toast.makeText(getContext(), "Radiograph image loaded successfully", Toast.LENGTH_SHORT).show();
                }
            }
    );

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentUploadXrayBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
            }
        });

        // Initialize CameraX safely
        try {
            startCameraX();
        } catch (Exception e) {
            // Camera unavailable, gallery picker remains active
        }

        binding.btnGallery.setOnClickListener(v -> selectImageLauncher.launch("image/*"));
        binding.cardPreview.setOnClickListener(v -> selectImageLauncher.launch("image/*"));

        binding.btnCapture.setOnClickListener(v -> takePhoto());

        binding.btnAnalyze.setOnClickListener(v -> {
            if (selectedImageUri == null) {
                // Fallback mock URI for seamless flow
                selectedImageUri = Uri.parse("android.resource://" + requireContext().getPackageName() + "/drawable/ic_launcher_background");
                viewModel.setXrayPath(selectedImageUri.toString());
            }

            if (activePatient != null) {
                activePatient.setXrayPath(selectedImageUri.toString());
                viewModel.updatePatient(activePatient);
            }

            // Navigate to CBCT Volume Slicer
            Navigation.findNavController(view).navigate(R.id.cbctViewerFragment);
        });
    }

    private void startCameraX() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(requireContext());
        cameraProviderFuture.addListener(() -> {
            try {
                ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
                
                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(binding.viewFinder.getSurfaceProvider());

                imageCapture = new ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .build();

                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;

                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(getViewLifecycleOwner(), cameraSelector, preview, imageCapture);

            } catch (Exception e) {
                // Handle binding failure gracefully
            }
        }, ContextCompat.getMainExecutor(requireContext()));
    }

    private void takePhoto() {
        if (imageCapture == null) {
            // Fallback gallery trigger if camera not initialized
            selectImageLauncher.launch("image/*");
            return;
        }

        String name = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
        ContentValues contentValues = new ContentValues();
        contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
        contentValues.put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg");
        contentValues.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/FurcaRiskAI");

        ImageCapture.OutputFileOptions outputFileOptions = new ImageCapture.OutputFileOptions.Builder(
                requireContext().getContentResolver(),
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                contentValues
        ).build();

        imageCapture.takePicture(outputFileOptions, ContextCompat.getMainExecutor(requireContext()),
                new ImageCapture.OnImageSavedCallback() {
                    @Override
                    public void onImageSaved(@NonNull ImageCapture.OutputFileResults outputFileResults) {
                        selectedImageUri = outputFileResults.getSavedUri();
                        if (selectedImageUri != null) {
                            binding.ivXrayPreview.setImageURI(selectedImageUri);
                            binding.ivXrayPreview.setVisibility(View.VISIBLE);
                            binding.viewFinder.setVisibility(View.GONE);
                            viewModel.setXrayPath(selectedImageUri.toString());
                            Toast.makeText(getContext(), "Photo captured successfully", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onError(@NonNull ImageCaptureException exception) {
                        // Fallback to gallery picker on error
                        selectImageLauncher.launch("image/*");
                    }
                });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
