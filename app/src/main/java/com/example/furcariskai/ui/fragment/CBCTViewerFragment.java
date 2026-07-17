package com.example.furcariskai.ui.fragment;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.SeekBar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentCbctViewerBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

import java.util.Random;

public class CBCTViewerFragment extends Fragment {
    private FragmentCbctViewerBinding binding;
    private MainViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentCbctViewerBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        binding.sbDepth.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                binding.tvDepthVal.setText("Slice #" + progress);
                drawTriplanarSlices(progress);
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.btnToAi.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.aiAnalysisFragment)
        );

        // Render default
        binding.sbDepth.setProgress(32);
    }

    private void drawTriplanarSlices(int depth) {
        // Draw Sagittal
        Bitmap sagBmp = Bitmap.createBitmap(150, 150, Bitmap.Config.ARGB_8888);
        Canvas sagCanvas = new Canvas(sagBmp);
        sagCanvas.drawColor(Color.parseColor("#030712"));
        Paint sagPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        
        // Bone base
        sagPaint.setColor(Color.parseColor("#1500F0FF"));
        Path sagBone = new Path();
        sagBone.moveTo(0, 150);
        sagBone.lineTo(0, 100 - (depth/2f));
        sagBone.quadTo(75, 100 - (depth/2f) + 15, 150, 100 - (depth/2f));
        sagBone.lineTo(150, 150);
        sagBone.close();
        sagCanvas.drawPath(sagBone, sagPaint);

        // Molar root slices
        sagPaint.setColor(Color.parseColor("#F8FAFC"));
        sagPaint.setStyle(Paint.Style.FILL);
        sagCanvas.drawCircle(55, 60 + (depth/5f), 12, sagPaint);
        sagCanvas.drawCircle(95, 60 - (depth/6f), 10, sagPaint);

        addCanvasNoise(sagCanvas, 150, 150);
        binding.ivSagittal.setImageBitmap(sagBmp);

        // Draw Coronal
        Bitmap corBmp = Bitmap.createBitmap(150, 150, Bitmap.Config.ARGB_8888);
        Canvas corCanvas = new Canvas(corBmp);
        corCanvas.drawColor(Color.parseColor("#030712"));
        Paint corPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

        // Bone level Coronal
        corPaint.setColor(Color.parseColor("#1500F5D4"));
        Path corBone = new Path();
        corBone.moveTo(0, 150);
        corBone.lineTo(0, 95);
        corBone.lineTo(55, 95);
        corBone.quadTo(75, 95 + (depth/2f), 95, 95);
        corBone.lineTo(150, 95);
        corBone.lineTo(150, 150);
        corBone.close();
        corCanvas.drawPath(corBone, corPaint);

        // Molar crown coronal
        corPaint.setColor(Color.parseColor("#CBD5E1"));
        corCanvas.drawRect(50, 30, 100, 70, corPaint);

        addCanvasNoise(corCanvas, 150, 150);
        binding.ivCoronal.setImageBitmap(corBmp);

        // Draw Axial
        Bitmap axBmp = Bitmap.createBitmap(300, 150, Bitmap.Config.ARGB_8888);
        Canvas axCanvas = new Canvas(axBmp);
        axCanvas.drawColor(Color.parseColor("#030712"));
        Paint axPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

        // Arch path
        axPaint.setColor(Color.parseColor("#2000F0FF"));
        axPaint.setStrokeWidth(6);
        axPaint.setStyle(Paint.Style.STROKE);
        axCanvas.drawArc(50, 80, 250, 200, 180, 180, false, axPaint);

        // Selected molar location
        axPaint.setColor(Color.parseColor("#00F0FF"));
        axPaint.setStyle(Paint.Style.FILL);
        axCanvas.drawCircle(85, 80, 8, axPaint);

        addCanvasNoise(axCanvas, 300, 150);
        binding.ivAxial.setImageBitmap(axBmp);
    }

    private void addCanvasNoise(Canvas canvas, int w, int h) {
        Paint p = new Paint();
        p.setColor(Color.WHITE);
        p.setAlpha(12);
        Random r = new Random();
        for (int i = 0; i < 200; i++) {
            int x = r.nextInt(w);
            int y = r.nextInt(h);
            canvas.drawPoint(x, y, p);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
