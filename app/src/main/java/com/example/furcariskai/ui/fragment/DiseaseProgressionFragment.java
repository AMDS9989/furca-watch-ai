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
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentDiseaseProgressionBinding;

public class DiseaseProgressionFragment extends Fragment {
    private FragmentDiseaseProgressionBinding binding;

    private final String[] timelines = {"Baseline", "6 Months", "1 Year", "2 Years"};
    private final String[] logs = {
            "Bone level is stable at furcation septum, but local attachment is compromised.",
            "AI predicts early micro-demineralization. Alveolar bone height drops by 0.6mm.",
            "Active osteoclastic resorption. Crestal bone drops below bifurcation crotch, early Grade I.",
            "Advanced GII cul-de-sac defect. Alveolar defect exceeds 2.8mm vertical resorption."
    };
    private final String[] losses = {"0.0 mm", "0.6 mm", "1.4 mm", "2.8 mm"};
    private final String[] risks = {"Low", "Moderate", "High", "Critical"};
    private final int[] colors = {Color.GREEN, Color.YELLOW, Color.RED, Color.RED};

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDiseaseProgressionBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.sbTimeline.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                binding.tvTimelineVal.setText(timelines[progress]);
                binding.tvTimelineBadge.setText(timelines[progress] + " Forecast");
                binding.tvLogMessage.setText(logs[progress]);
                binding.tvPredictedLoss.setText(losses[progress]);
                binding.tvRiskStatus.setText(risks[progress]);
                binding.tvRiskStatus.setTextColor(colors[progress]);
                drawProgressionDiagram(progress);
            }
            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {}
            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {}
        });

        binding.btnNext.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.treatmentRecommendationFragment)
        );

        binding.sbTimeline.setProgress(0);
    }

    private void drawProgressionDiagram(int step) {
        Bitmap bmp = Bitmap.createBitmap(200, 160, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);
        canvas.drawColor(Color.parseColor("#0F172A"));
        
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(Color.WHITE);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3.5f);

        // Molar root shape
        Path molar = new Path();
        molar.moveTo(60, 40);
        molar.quadTo(75, 20, 85, 30);
        molar.quadTo(95, 20, 110, 40);
        molar.quadTo(110, 60, 100, 70);
        canvas.drawPath(molar, paint);

        // Bone level drops as step increases
        int boneY = 110 + (step * 10);

        paint.setColor(Color.parseColor("#1500F0FF"));
        paint.setStyle(Paint.Style.FILL);
        Path boneFill = new Path();
        boneFill.moveTo(10, boneY);
        boneFill.lineTo(70, boneY);
        boneFill.quadTo(80, boneY + 10, 90, boneY + 10);
        boneFill.quadTo(98, boneY + 10, 100, boneY);
        boneFill.lineTo(190, boneY);
        boneFill.lineTo(190, 160);
        boneFill.lineTo(10, 160);
        boneFill.close();
        canvas.drawPath(boneFill, paint);

        // Draw Bone Line outline
        paint.setColor(Color.parseColor("#00F0FF"));
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(3f);
        Path boneLine = new Path();
        boneLine.moveTo(10, boneY);
        boneLine.lineTo(70, boneY);
        boneLine.quadTo(80, boneY + 10, 90, boneY + 10);
        boneLine.quadTo(98, boneY + 10, 100, boneY);
        boneLine.lineTo(190, boneY);
        canvas.drawPath(boneLine, paint);

        binding.ivProgressionDiagram.setImageBitmap(bmp);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
