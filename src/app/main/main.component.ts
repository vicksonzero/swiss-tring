import { AfterContentChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { SIDEBAR_CROSSING_CONNECTOR_MOMENTUM, SIDEBAR_LEAD, SIDEBAR_WIDTH, SIDEBAR_X } from 'src/constants';
import { TABLET_PORTRAIT } from 'src/media';
import { hashStringToColor, hashStringToNumber } from 'src/utils';
import { Step } from '../s/Step';
import { StepsService } from '../s/steps.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy, AfterContentChecked {

  public faInfoCircle = faInfoCircle;
  steps: Step[];

  stepsJSON = '';
  isMobile = false;

  graphWidth = 0;
  graphHeight = 0;
  @ViewChild('graph', { static: false }) graphElement: ElementRef<SVGSVGElement>;
  @ViewChild('front', { static: false }) frontElement: ElementRef<HTMLDivElement>;
  @ViewChild('back', { static: false }) backElement: ElementRef<HTMLDivElement>;
  updateGraphInterval = 0;

  constructor(private stepsService: StepsService) {
    this.stepsService.steps$.subscribe((steps) => {
      this.steps = steps;
      this.stepsJSON = JSON.stringify(steps, null, 4);
      // console.log(this.stepsService.contexts);
      // console.log(this.stepsService.contextHolders);
    });
  }

  ngOnInit() {
    this.updateDeviceWidth();
    this.updateGraphInterval = window.setInterval(() => this.updateDataFlowGraph(), 1000);
  }

  ngOnDestroy() {
    if (this.updateGraphInterval) {
      clearInterval(this.updateGraphInterval);
    }
  }


  ngAfterContentChecked() {
    this.updateDataFlowGraph();
  }

  onClickAddStep() {
    this.stepsService.addStep();
  }

  trackItem(index: number, item: Step) {
    return item.id;
  }

  updateDataFlowGraph() {
    if (!this.frontElement) { return; }
    const viewWidgets = document.querySelectorAll('app-view-widget');
    const operatorWidgets = document.querySelectorAll('app-operator-widget');
    // console.log('updateDataFlowGraph', viewWidgets, operatorWidgets);

    this.graphWidth = this.frontElement.nativeElement.clientWidth;
    this.graphHeight = this.frontElement.nativeElement.clientHeight;
    this.backElement.nativeElement.innerHTML = '';
    const svg = this.createSVG(this.backElement.nativeElement);
    const backBB = this.backElement.nativeElement.getBoundingClientRect();

    // draw lines
    this.stepsService.contexts.forEach((context, beforeStepIndex) => {
      const { beforeStepID, keys } = context;
      keys.forEach(({ fromID, toID, name, fromStepIndex }, keyIndex) => {
        const fromWidgetElement = document.querySelector(`[data-entity-id="${fromID}"]`);
        const toWidgetElement = document.querySelector(`[data-entity-id="${toID}"]`);
        if (!fromWidgetElement || !toWidgetElement) { return; }
        const fromBB = fromWidgetElement.getBoundingClientRect();
        const toBB = toWidgetElement.getBoundingClientRect();

        if (fromBB.top === 0 && fromBB.left === 0) { return; }
        if (toBB.top === 0 && toBB.left === 0) { return; }

        const fromPoint = {
          x: - backBB.left + ((fromBB.left + fromBB.right) / 2),
          y: - backBB.top + (fromBB.bottom + 4),
        };
        if (this.isMobile) {
          fromPoint.x = - backBB.left + fromBB.left + fromBB.width * (keyIndex + 0.5) / keys.length;
        }
        const toPoint = {
          x: - backBB.left + ((toBB.left + toBB.right) / 2),
          y: - backBB.top + (toBB.top - 4),
        };
        if (this.isMobile) {
          toPoint.x = - backBB.left + toBB.left + toBB.width * (keyIndex + 0.5) / keys.length;
        }
        // console.log(fromWidgetElement, toWidgetElement);

        const line = (() => {
          if (beforeStepIndex - fromStepIndex <= 1) {
            return [
              `M`,
              `${fromPoint.x} ${fromPoint.y}`,
              `C`,
              [
                `${fromPoint.x} ${fromPoint.y + SIDEBAR_CROSSING_CONNECTOR_MOMENTUM}`,
                `${toPoint.x} ${toPoint.y - SIDEBAR_CROSSING_CONNECTOR_MOMENTUM}`,
                `${toPoint.x} ${toPoint.y}`,
              ].join(', '),
            ].join(' ');
          } else {
            const escapeX = SIDEBAR_X + hashStringToNumber(name) * SIDEBAR_WIDTH;

            const curve1 = [
              `${fromPoint.x} ${fromPoint.y + SIDEBAR_CROSSING_CONNECTOR_MOMENTUM}`,
              `${escapeX} ${fromPoint.y + SIDEBAR_LEAD - SIDEBAR_CROSSING_CONNECTOR_MOMENTUM}`,
              `${escapeX} ${fromPoint.y + SIDEBAR_LEAD}`,
            ].join(', ');

            const curve2 = [
              `${escapeX} ${toPoint.y - SIDEBAR_LEAD + SIDEBAR_CROSSING_CONNECTOR_MOMENTUM}`,
              `${toPoint.x} ${toPoint.y - SIDEBAR_CROSSING_CONNECTOR_MOMENTUM}`,
              `${toPoint.x} ${toPoint.y}`,
            ].join(', ');

            return [
              `M`, `${fromPoint.x} ${fromPoint.y}`,
              `C`, curve1,
              `L`, `${escapeX} ${toPoint.y - SIDEBAR_LEAD}`,
              `C`, curve2,
            ].join(' ');
          }
        })();

        const pathBG = this.createPath(svg);
        pathBG.setAttributeNS(null, 'stroke', '#DDD');
        pathBG.setAttributeNS(null, 'stroke-width', '6');
        pathBG.setAttributeNS(null, 'd', line);
        const path = this.createPath(svg);
        path.setAttributeNS(null, 'stroke', hashStringToColor(name));
        path.setAttributeNS(null, 'stroke-width', '3');
        path.setAttributeNS(null, 'd', line);

        const circleIn = this.createPoint(svg);
        circleIn.setAttributeNS(null, 'fill', hashStringToColor(name));
        circleIn.setAttributeNS(null, 'cx', '' + fromPoint.x);
        circleIn.setAttributeNS(null, 'cy', '' + fromPoint.y);
        const circleOut = this.createPoint(svg);
        circleOut.setAttributeNS(null, 'fill', hashStringToColor(name));
        circleOut.setAttributeNS(null, 'cx', '' + toPoint.x);
        circleOut.setAttributeNS(null, 'cy', '' + toPoint.y);
      });
    });
  }

  createSVG(svgContainer: HTMLDivElement) {

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttributeNS(null, 'id', 'svgDoc');
    svg.setAttributeNS(null, 'width', '' + this.graphWidth);
    svg.setAttributeNS(null, 'height', '' + this.graphHeight);

    // const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    // rect.setAttributeNS(null, 'width', '100%');
    // rect.setAttributeNS(null, 'height', '100%');
    // rect.setAttributeNS(null, 'stroke', '#000');
    // rect.setAttributeNS(null, 'stroke-width', '3');
    // rect.setAttributeNS(null, 'fill', '#AAA');
    // svg.appendChild(rect);

    svgContainer.appendChild(svg);
    return svg;
  }
  createPath(svg: SVGSVGElement) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'stroke', '#DDD');
    path.setAttributeNS(null, 'stroke-width', '3');
    path.setAttributeNS(null, 'fill', 'transparent');
    svg.appendChild(path);

    return path;
  }

  createPoint(svg: SVGSVGElement) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttributeNS(null, 'r', '7');
    circle.setAttributeNS(null, 'stroke', '#DDD');
    circle.setAttributeNS(null, 'stroke-width', '3');
    circle.setAttributeNS(null, 'fill', '#0A0');
    svg.appendChild(circle);

    return circle;
  }

  createRect(svg: SVGSVGElement) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttributeNS(null, 'stroke', '#EEE');
    rect.setAttributeNS(null, 'stroke-width', '3');
    rect.setAttributeNS(null, 'fill', '#0A0');
    svg.appendChild(rect);

    return rect;
  }

  createText(svg: SVGSVGElement) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    rect.setAttributeNS(null, 'class', '#EEE');
    svg.appendChild(rect);

    return rect;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateDeviceWidth();
  }
  updateDeviceWidth() {
    const innerWidth = window.innerWidth;

    this.isMobile = (innerWidth < TABLET_PORTRAIT);

  }
}
