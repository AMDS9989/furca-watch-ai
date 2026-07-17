package com.example.furcariskai.ui.fragment;

import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.example.furcariskai.data.model.Patient;
import com.example.furcariskai.databinding.FragmentGenerateReportBinding;
import com.example.furcariskai.viewmodel.MainViewModel;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class GenerateReportFragment extends Fragment {
    private FragmentGenerateReportBinding binding;
    private MainViewModel viewModel;
    private Patient activePatient;
    private File pdfFile;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentGenerateReportBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(MainViewModel.class);

        viewModel.getSelectedPatient().observe(getViewLifecycleOwner(), patient -> {
            if (patient != null) {
                activePatient = patient;
                binding.tvPdfPatientName.setText(patient.getName());
                binding.tvPdfPatientId.setText("ID: " + patient.getId());
                binding.tvPdfAgeGender.setText(patient.getAge() + " / " + patient.getGender());
                binding.tvPdfPdVal.setText(patient.getPocketDepth() + ".0 mm");
                binding.tvPdfCalVal.setText(patient.getClinicalAttachmentLoss() + ".0 mm");
                binding.tvPdfMolarVal.setText("Tooth #" + patient.getToothNumber());
                
                String r = patient.getRiskScore() >= 75 ? "CRITICAL" : patient.getRiskScore() >= 55 ? "HIGH" : patient.getRiskScore() >= 35 ? "MODERATE" : "LOW";
                binding.tvPdfRiskBadge.setText(r + " RISK (" + String.format("%.1f%%", patient.getRiskScore()) + ")");
            }
        });

        binding.btnDownloadPdf.setOnClickListener(v -> generatePdfFile());

        binding.btnShareReport.setOnClickListener(v -> sharePdfFile());
    }

    private void generatePdfFile() {
        if (activePatient == null) return;

        PdfDocument document = new PdfDocument();
        PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(300, 600, 1).create();
        PdfDocument.Page page = document.startPage(pageInfo);
        
        Canvas canvas = page.getCanvas();
        Paint paint = new Paint();

        // Title
        paint.setColor(Color.BLUE);
        paint.setTextSize(14f);
        paint.setFakeBoldText(true);
        canvas.drawText("FURCARISK AI™ REPORT", 20, 40, paint);

        // Subtitle
        paint.setColor(Color.BLACK);
        paint.setTextSize(10f);
        paint.setFakeBoldText(false);
        canvas.drawText("Early Warning Diagnostic Summary", 20, 60, paint);
        canvas.drawLine(20, 70, 280, 70, paint);

        // Body Text
        paint.setTextSize(9f);
        canvas.drawText("Patient Name: " + activePatient.getName(), 20, 95, paint);
        canvas.drawText("Patient ID: " + activePatient.getId(), 20, 115, paint);
        canvas.drawText("Age / Gender: " + activePatient.getAge() + " / " + activePatient.getGender(), 20, 135, paint);
        canvas.drawText("Target Molar: Tooth #" + activePatient.getToothNumber(), 20, 155, paint);

        String r = activePatient.getRiskScore() >= 75 ? "CRITICAL" : activePatient.getRiskScore() >= 55 ? "HIGH" : activePatient.getRiskScore() >= 35 ? "MODERATE" : "LOW";
        canvas.drawText("Prognostic Risk: " + r + " (" + String.format("%.1f%%", activePatient.getRiskScore()) + ")", 20, 185, paint);
        
        canvas.drawLine(20, 205, 280, 205, paint);
        canvas.drawText("Pocket Depth: " + activePatient.getPocketDepth() + " mm", 20, 225, paint);
        canvas.drawText("Attachment Loss: " + activePatient.getClinicalAttachmentLoss() + " mm", 20, 245, paint);
        canvas.drawText("Mobility Grade: " + activePatient.getMobility(), 20, 265, paint);

        // Recommendations
        canvas.drawLine(20, 290, 280, 290, paint);
        canvas.drawText("Recommended Actions:", 20, 310, paint);
        canvas.drawText("- Guided Tissue Regeneration & Grafts", 20, 330, paint);
        canvas.drawText("- Occlusal load bite alignment relief", 20, 350, paint);

        // Signatures
        paint.setTextSize(8f);
        canvas.drawText("Lead Clinician: Dr. Shahid", 20, 520, paint);
        canvas.drawLine(20, 510, 110, 510, paint);
        
        canvas.drawText("FURCARISK AI CERTIFIED", 160, 520, paint);
        canvas.drawCircle(195, 490, 20, paint);

        document.finishPage(page);

        // Save PDF to local cache dir
        pdfFile = new File(requireContext().getCacheDir(), "FurcaRiskReport_" + activePatient.getId() + ".pdf");
        try (FileOutputStream fos = new FileOutputStream(pdfFile)) {
            document.writeTo(fos);
            Toast.makeText(getContext(), "PDF report downloaded", Toast.LENGTH_SHORT).show();
        } catch (IOException e) {
            Toast.makeText(getContext(), "Failed to generate PDF: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        } finally {
            document.close();
        }
    }

    private void sharePdfFile() {
        if (pdfFile == null || !pdfFile.exists()) {
            generatePdfFile();
        }

        if (pdfFile != null && pdfFile.exists()) {
            Uri pdfUri = FileProvider.getUriForFile(requireContext(), 
                    requireContext().getPackageName() + ".fileprovider", pdfFile);
            
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("application/pdf");
            shareIntent.putExtra(Intent.EXTRA_STREAM, pdfUri);
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(shareIntent, "Share Diagnostic Report"));
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
