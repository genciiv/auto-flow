export class NextResponse {
  static json(payload, init = {}) {
    const headers = new Headers(init.headers);

    return {
      status: init.status ?? 200,
      headers,
      async json() {
        return payload;
      },
    };
  }
}
