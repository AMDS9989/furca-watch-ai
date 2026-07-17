package com.example.furcariskai.ui.fragment;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentAiAnalysisBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

public class AIAnalysisFragment extends Fragment {
    private FragmentAiAnalysisBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAiAnalysisBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        // Load preview X-ray
        viewModel.getXrayPath().observe(getViewLifecycleOwner(), path -> {
            if (path != null && !path.isEmpty()) {
                binding.ivXrayImage.setImageURI(Uri.parse(path));
            } else {
                binding.ivXrayImage.setImageResource(android.R.drawable.ic_menu_gallery);
            }
        });

        // Laser scan animation
        startScanlineAnimation();

        // Heatmap drawing callback
        new Handler(Looper.getMainLooper()).postDelayed(this::drawHeatmapAndBoundingBox, 1800);

        binding.btnPredict.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.aiPredictionFragment)
        );
    }

    private void startScanlineAnimation() {
        binding.viewLaserLine.setTranslationY(0);
        binding.viewLaserLine.animate()
                .translationY(400) // sweep height
                .setDuration(1600)
                .withEndAction(() -> binding.viewLaserLine.setVisibility(View.GONE))
                .start();
    }

    private void drawHeatmapAndBoundingBox() {
        if (binding == null) return;
        
        // Renders simulated AI result details overlaying the X-ray
        Bitmap overlayBmp = Bitmap.createBitmap(300, 300, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(overlayBmp);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);

        // Heatmap gradient
        RadialGradient grad = new RadialGradient(150, 160, 40,
                new int[]{Color.parseColor("#CCFF4D6D"), Color.parseColor("#66FFB703"), Color.TRANSPARENT},
                null, Shader.TileMode.CLAMP);
        paint.setShader(grad);
        canvas.drawCircle(150, 160, 45, paint);

        // Bounding Box
        paint.setShader(null);
        paint.setColor(Color.parseColor("#00F0FF"));
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3.5f);
        canvas.drawRect(120, 130, 180, 190, paint);

        // ROI Label
        paint.setStyle(Paint.Style.FILL);
        paint.setTextSize(10f);
        canvas.drawText("ROI: FURCATION BONE", 120, 122, paint);

        binding.ivAnalysisOverlay.setImageBitmap(overlayBmp);
        binding.ivAnalysisOverlay.setVisibility(View.VISIBLE);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
