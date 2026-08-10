import { API_CONFIG } from "@/lib/api-config";
import { CodeBlock } from "../CodeBlock";
import { ScopeBadge } from "../ScopeBadge";

export const ScopesSection = () => {
  const scopes = [
    {
      id: "scope-profile",
      name: "profile",
      required: true,
      description: "User profile information including name and age verification status. No photo is shared.",
      grantedEndpoints: ["/userinfo"],
      responseFields: [
        { field: "sub", description: "Unique user identifier" },
        { field: "email", description: "User's email address" },
        { field: "first_name", description: "User's first name" },
        { field: "last_name", description: "User's last name" },
        { field: "full_name", description: "User's full name" },
        { field: "valyd_id", description: "The user's unique Valyd account identifier" },
        { field: "id_verified", description: "Whether ID is verified (boolean)" },
        { field: "created_at", description: "Account creation timestamp" },
      ],
    },
    {
      id: "scope-verifications",
      name: "verifications",
      required: false,
      description: "Identity verification data including ID verification status, face match confidence, and verification timestamps.",
      grantedEndpoints: ["/verifications"],
      responseFields: [
        { field: "id_verified", description: "Whether the user's ID is verified" },
        { field: "face_match", description: "Face match confidence score (0-1)" },
        { field: "last_checked", description: "Timestamp of last verification check" },
      ],
    },
    {
      id: "scope-zkp",
      name: "zkp",
      required: false,
      description: "Zero-Knowledge Proof age verification data. Allows age verification without revealing exact birth date.",
      grantedEndpoints: ["ZKP-related endpoints"],
      responseFields: [
        { field: "is_18", description: "Whether user is 18+ (without revealing age)" },
        { field: "is_21", description: "Whether user is 21+ (without revealing age)" },
        { field: "is_25", description: "Whether user is 25+ (without revealing age)" },
      ],
    },
    {
      id: "scope-mcp",
      name: "mcp",
      required: false,
      description: "Access to Model Context Protocol (MCP) endpoints. Lets AI agents and tools retrieve the user's authorized identity and verification data through the MCP interface, on the user's behalf.",
      grantedEndpoints: ["MCP endpoints"],
      responseFields: [
        { field: "tools", description: "MCP tools the agent is authorized to call" },
        { field: "context", description: "User identity and verification context exposed to the agent" },
      ],
    },
  ];

  return (
    <div className="space-y-12">
      {/* Scopes Overview */}
      <section className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">OAuth2 Scopes</h2>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">
            {API_CONFIG.BRAND_NAME} uses OAuth2 scope-based access control. When initiating the 
            authorization flow, you specify which permissions your application needs. Users will 
            see these scopes on the consent screen before granting access.
          </p>

          {/* Scopes Summary Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Scope</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Required</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Description</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Grants Access To</th>
                </tr>
              </thead>
              <tbody>
                {scopes.map((scope) => (
                  <tr key={scope.name} className="border-t border-border">
                    <td className="px-4 py-3">
                      <ScopeBadge scope={scope.name} required={scope.required} size="md" />
                    </td>
                    <td className="px-4 py-3">
                      {scope.required ? (
                        <span className="text-orange-600 font-medium">Yes (Mandatory)</span>
                      ) : (
                        <span className="text-muted-foreground">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{scope.description.split('.')[0]}</td>
                    <td className="px-4 py-3 font-mono text-primary text-sm">
                      {scope.grantedEndpoints.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Requesting Scopes */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Requesting Scopes</h3>
            <p className="text-muted-foreground mb-4">
              Include the <code className="bg-muted px-1 rounded">scope</code> parameter in your 
              authorization URL. Multiple scopes should be <strong>space-separated</strong> and URL encoded:
            </p>
            <CodeBlock
              code={`const scopes = "profile verifications zkp"; // Space-separated

const authURL = \`${API_CONFIG.IDP_BASE_URL}/auth?client_id=\${clientId}&redirect_url=\${redirectUrl}&scope=\${encodeURIComponent(scopes)}\`;

// Result: scope=profile%20verifications%20zkp`}
              language="javascript"
              title="JavaScript"
            />
          </div>

          {/* Scope Enforcement */}
          <div className="p-6 rounded-lg border border-orange-200 bg-orange-50">
            <h3 className="text-lg font-semibold text-orange-800 mb-4">⚠️ Scope Enforcement</h3>
            <ul className="space-y-2 text-orange-700">
              <li>• Scopes are verified against your project settings in the Developer Portal</li>
              <li>• If you request a scope not enabled for your project, authorization will fail</li>
              <li>• If your access token doesn't have a required scope, the endpoint returns <code className="bg-orange-100 px-1 rounded">403 Forbidden</code></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Individual Scope Details */}
      {scopes.map((scope) => (
        <section key={scope.id} id={scope.id} className="scroll-mt-8">
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3 flex-wrap">
                <ScopeBadge scope={scope.name} required={scope.required} size="md" />
                {scope.required && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                    Mandatory
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-3">{scope.description}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Endpoints */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Grants Access To</h4>
                <div className="flex flex-wrap gap-2">
                  {scope.grantedEndpoints.map((endpoint) => (
                    <code
                      key={endpoint}
                      className="px-3 py-1 bg-muted rounded-lg text-sm font-mono text-foreground"
                    >
                      {endpoint}
                    </code>
                  ))}
                </div>
              </div>

              {/* Response Fields */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Response Fields</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-foreground">Field</th>
                        <th className="text-left px-4 py-2 font-medium text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scope.responseFields.map((field) => (
                        <tr key={field.field} className="border-t border-border">
                          <td className="px-4 py-2 font-mono text-primary">{field.field}</td>
                          <td className="px-4 py-2 text-muted-foreground">{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Error Response */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Missing Scope Error (403)</h4>
                <CodeBlock
                  code={`{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the ${scope.name} scope"
  }
}`}
                  language="json"
                  title="Error Response"
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
};
