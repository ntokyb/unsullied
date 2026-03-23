import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  template: `
    <div class="signature-pad-container">
      <canvas
        #signatureCanvas
        class="border-2 border-gray-300 rounded-lg bg-white touch-none w-full"
        style="height: 200px;"
      ></canvas>
      <div class="mt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <button
          type="button"
          (click)="clear()"
          class="btn-secondary text-sm px-4 py-2"
        >
          Clear Signature
        </button>
        <p class="text-xs text-gray-500">Sign above to confirm completion</p>
      </div>
    </div>
  `,
  styles: [`
    .signature-pad-container {
      width: 100%;
    }
    canvas {
      display: block;
      width: 100% !important;
      touch-action: none;
      -webkit-user-select: none;
      user-select: none;
    }
    @media (min-width: 640px) {
      canvas {
        height: 250px !important;
      }
    }
  `]
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('signatureCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureChange = new EventEmitter<string | null>();
  @Input() width: number = 600;
  @Input() height: number = 200;

  private signaturePad!: SignaturePad;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual canvas size based on container
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.getContext('2d')?.scale(dpr, dpr);
    
    // Set CSS size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 1,
      maxWidth: 3,
      throttle: 16
    });

    // Handle resize
    const resizeHandler = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.getContext('2d')?.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      this.signaturePad.clear();
    };

    window.addEventListener('resize', resizeHandler);

    // Emit signature on change
    this.signaturePad.addEventListener('endStroke', () => {
      this.emitSignature();
    });
  }

  clear(): void {
    this.signaturePad.clear();
    this.emitSignature();
  }

  isEmpty(): boolean {
    return this.signaturePad.isEmpty();
  }

  getSignature(): string | null {
    if (this.signaturePad.isEmpty()) {
      return null;
    }
    return this.signaturePad.toDataURL('image/png');
  }

  private emitSignature(): void {
    this.signatureChange.emit(this.getSignature());
  }
}
