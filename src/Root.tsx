import { Composition, Folder } from "remotion";
import { ALL_FORMATS } from "./formats";
import { TEMPLATES } from "./templates/registry";

// Every template is registered once per platform format, so you get
// e.g. "YouTube-TitleCard", "Short-TitleCard", "FB-Square-TitleCard", "FB-Feed-TitleCard".
// Composition IDs: <Format>-<Template>. Add a template in templates/registry.ts.
export const RemotionRoot: React.FC = () => (
  <>
    {ALL_FORMATS.map((f) => (
      <Folder key={f.id} name={f.id}>
        {TEMPLATES.map((t) => (
          <Composition
            key={t.id}
            id={`${f.id}-${t.id}`}
            component={t.component}
            schema={t.schema}
            defaultProps={t.defaultProps}
            durationInFrames={Math.round((t.duration(t.defaultProps) * f.fps) / 30)}
            fps={f.fps}
            width={f.width}
            height={f.height}
            calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round((t.duration(props) * f.fps) / 30)) })}
          />
        ))}
      </Folder>
    ))}
  </>
);
