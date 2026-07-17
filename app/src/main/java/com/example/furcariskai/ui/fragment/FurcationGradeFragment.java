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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.navigation.Navigation;

import com.example.furcariskai.R;
import com.example.furcariskai.databinding.FragmentFurcationGradeBinding;

public class FurcationGradeFragment extends Fragment {
    private FragmentFurcationGradeBinding binding;
    private int selectedGrade = 2; // Default GII

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentFurcationGradeBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.btnG0.setOnClickListener(v -> selectGrade(0));
        binding.btnG1.setOnClickListener(v -> selectGrade(1));
        binding.btnG2.setOnClickListener(v -> selectGrade(2));
        binding.btnG3.setOnClickListener(v -> selectGrade(3));
        binding.btnG4.setOnClickListener(v -> selectGrade(4));

        binding.btnNext.setOnClickListener(v -> 
            Navigation.findNavController(view).navigate(R.id.diseaseProgressionFragment)
        );

        selectGrade(selectedGrade);
    }

    private void selectGrade(int grade) {
        selectedGrade = grade;
        
        binding.btnG0.setSelected(grade == 0);
        binding.btnG1.setSelected(grade == 1);
        binding.btnG2.setSelected(grade == 2);
        binding.btnG3.setSelected(grade == 3);
        binding.btnG4.setSelected(grade == 4);

        // Update Text and Diagram
        drawGradeDiagram(grade);
    }

    private void drawGradeDiagram(int grade) {
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

        // Dynamic Bone and Probe Drawing according to Grade
        int boneY = 120;
        int probeStartX = 140;
        int probeStartY = 80;
        int probeEndX = 100;
        int probeEndY = 118;
        
        String title = "";
        String desc = "";

        switch (grade) {
            case 0:
                boneY = 100;
                title = "Grade 0: Normal Septum";
                desc = "Inter-radicular bone is completely intact at the bifurcation septum. No horizontal attachment probe penetration is possible.";
                probeEndX = 140; probeEndY = 80; // Hidden
                break;
            case 1:
                boneY = 105;
                title = "Grade I: Incipient catch";
                desc = "Early bone loss. Horizontal Nabers probe penetration is less than 3 mm. Soft tissue catch is felt at the furcation crotch.";
                probeEndX = 115; probeEndY = 110;
                break;
            case 2:
                boneY = 120;
                title = "Grade II: Cul-de-sac Defect";
                desc = "Horizontal bone loss exceeds 3 mm but does not encompass the entire width. Nabers probe enters but cannot emerge on the opposite side.";
                probeEndX = 100; probeEndY = 118;
                break;
            case 3:
                boneY = 138;
                title = "Grade III: Through-and-Through";
                desc = "Horizontal bone loss spans the entire width. Nabers probe passes completely through roots. Defect is covered by gingival tissue.";
                probeEndX = 85; probeEndY = 135;
                break;
            case 4:
                boneY = 145;
                title = "Grade IV: Exposed Tunnel";
                desc = "Complete horizontal through-and-through bone loss. Recession of gingival margins has clinically exposed the furcation entrance.";
                probeEndX = 75; probeEndY = 142;
                break;
        }

        binding.tvGradeTitle.setText(title);
        binding.tvGradeDesc.setText(desc);

        // Draw Bone Line
        paint.setColor(Color.parseColor("#00F0FF"));
        paint.setStrokeWidth(4.5f);
        Path bone = new Path();
        bone.moveTo(20, boneY);
        bone.lineTo(75, boneY);
        bone.quadTo(82, boneY + 12, 90, boneY + 15);
        bone.quadTo(98, boneY + 15, 105, boneY);
        bone.lineTo(180, boneY);
        canvas.drawPath(bone, paint);

        // Draw Probe Line (if not G0)
        if (grade > 0) {
            paint.setColor(Color.parseColor("#FF4D6D"));
            paint.setStrokeWidth(3f);
            canvas.drawLine(probeStartX, probeStartY, probeEndX, probeEndY, paint);
            canvas.drawCircle(probeEndX, probeEndY, 3f, paint);
        }

        binding.ivGradeDiagram.setImageBitmap(bmp);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
