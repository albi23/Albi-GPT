import {ChangeDetectionStrategy, Component, EventEmitter, signal, WritableSignal} from '@angular/core';

import {Renderable} from '../../model/renderable';
import {MarkdownComponent, MarkdownService} from 'ngx-markdown';
import {ClipboardButtonComponent} from './clipboard-button/clipboard-button.component';


@Component({
    selector: 'albi-java-tips',
    imports: [MarkdownComponent, ClipboardButtonComponent],
    providers: [MarkdownService],
    templateUrl: './java-tips.component.html',
    styleUrls: ['./java-tips.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class JavaTipsComponent implements Renderable {

  parsingDone: WritableSignal<boolean> = signal(false);

  readonly clipboardButton = ClipboardButtonComponent;

  readonly properties = '```properties' +
    '\n# Setup for junit-platform.properties' +
    '\njunit.jupiter.execution.parallel.enabled = true' +
    '\njunit.jupiter.execution.parallel.mode.default = same_thread' +
    '\njunit.jupiter.execution.parallel.mode.classes.default = same_thread';

  readonly annotation = '```java' +
    '\n// Creating custom annotation which inherit behaviour from' +
    '\n// Junit @Execution(ExecutionMode.CONCURRENT) which allow run all test method inside 1 thread but' +
    '\n// in parallel with other classes' +
    '\n@Execution(ExecutionMode.CONCURRENT)' +
    '\n@TestInstance(TestInstance.Lifecycle.PER_METHOD)' +
    '\n@Retention(RetentionPolicy.RUNTIME)' +
    '\n@Target(ElementType.TYPE)' +
    '\npublic @interface ParallelTest {' +
    '\n}';

  readonly code = '```java' +
    '\n// Now when you will annotate classes with new annotation both will be run in parallel' +
    '\n// Give it try!' +
    '\n@ParallelTest' +
    '\nclass EnvironmentTest {' +
    '\n    @Test' +
    '\n    void methodRunInParallel(){' +
    '\n        System.out.println(Thread.currentThread().getName());' +
    '\n    }\n}\n';

  renderDone(evt: EventEmitter<boolean>): void {
    Renderable.scrollToBottom();
    Renderable.actionAfterDelay(4000, () => evt.emit(true));
    Renderable.scrollToBottomAfterDelay(2000);
    Renderable.scrollToBottomAfterDelay(3000);
    Renderable.scrollToBottomAfterDelay(4000);
  }

  onParseReady(componentIdx: number): void {
    this.parsingDone.set(true);
  }

}
