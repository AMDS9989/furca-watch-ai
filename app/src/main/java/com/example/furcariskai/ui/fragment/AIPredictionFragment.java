package com.example.furcariskai.ui.fragment;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentAiPredictionBinding;

import java.util.Random;

public class AIPredictionFragment extends Fragment {
    private FragmentAiPredictionBinding binding;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean isRunning = true;
    private int stepIndex = 0;
    
    private final String[] statusSteps = new String[]{
            "Consolidating molar root parameters...",
            "Simulating occlusal mechanical stress...",
            "Evaluating diabetic & smoking systemic load...",
            "Generating AI prognostics models..."
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAiPredictionBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Animate Processing Status texts
        runStatusStepsUpdates();

        // Animate Neural Network Canvas
        runNeuralNetCanvasAnimation();
    }

    private void runStatusStepsUpdates() {
        if (!isRunning || binding == null) return;
        
        binding.tvStatusMessage.setText(statusSteps[stepIndex]);
        
        stepIndex++;
        if (stepIndex < statusSteps.length) {
            handler.postDelayed(this::runStatusStepsUpdates, 900);
        } else {
            handler.postDelayed(() -> {
                if (isAdded()) {
                    Navigation.findNavController(requireView()).navigate(R.id.riskScoreFragment);
                }
            }, 900);
        }
    }

    private void runNeuralNetCanvasAnimation() {
        final int w = 300;
        final int h = 200;
        final Bitmap bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        final Canvas canvas = new Canvas(bmp);
        final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        final Random random = new Random();

        // Node definitions
        final int nodeCount = 16;
        final float[] xs = new float[nodeCount];
        final float[] ys = new float[nodeCount];
        for (int i = 0; i < nodeCount; i++) {
            xs[i] = 40 + random.nextFloat() * (w - 80);
            ys[i] = 30 + random.nextFloat() * (h - 60);
        }

        final Runnable drawRunnable = new Runnable() {
            @Override
            public void run() {
                if (!isRunning || binding == null) return;

                canvas.drawColor(Color.parseColor("#080E1E"));

                // Connections
                paint.setColor(Color.parseColor("#1500F0FF"));
                paint.setStrokeWidth(1.5f);
                for (int i = 0; i < nodeCount; i++) {
                    for (int j = i + 1; j < nodeCount; j++) {
                        float d = (float) Math.hypot(xs[i] - xs[j], ys[i] - ys[j]);
                        if (d < 65) {
                            canvas.drawLine(xs[i], ys[i], xs[j], ys[j], paint);
                        }
                    }
                }

                // Node items
                paint.setColor(Color.parseColor("#00F0FF"));
                for (int i = 0; i < nodeCount; i++) {
                    // Small random jitter
                    xs[i] += (random.nextFloat() - 0.5f) * 2;
                    ys[i] += (random.nextFloat() - 0.5f) * 2;

                    canvas.drawCircle(xs[i], ys[i], 4.5f, paint);
                }

                binding.ivNeuralCanvas.setImageBitmap(bmp);
                handler.postDelayed(this, 60);
            }
        };

        handler.post(drawRunnable);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        isRunning = false;
        binding = null;
    }
}
